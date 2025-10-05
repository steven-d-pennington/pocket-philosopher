/**
 * Community State Provider
 * Synchronizes Zustand store with database profile state on mount
 * Created: 2025-10-05
 */

'use client';

import { useEffect, useRef } from 'react';
import { useCommunityStore } from '@/lib/stores/community-store';
import { createClient } from '@/lib/supabase/client';

export function CommunityStateProvider() {
  const { isEnabled, displayName } = useCommunityStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const syncCommunityState = async () => {
      try {
        const supabase = createClient();

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // User not logged in, reset community state
          useCommunityStore.setState({
            isEnabled: false,
            displayName: null,
          });
          return;
        }

        // Fetch profile to get actual community_enabled state
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('community_enabled, display_name')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching community state:', error);
          return;
        }

        // Sync store with database state
        const dbEnabled = profile?.community_enabled ?? false;
        const dbDisplayName = profile?.display_name ?? null;

        // Only update if there's a mismatch
        if (isEnabled !== dbEnabled || displayName !== dbDisplayName) {
          console.log('[CommunityStateProvider] Syncing state:', {
            from: { isEnabled, displayName },
            to: { isEnabled: dbEnabled, displayName: dbDisplayName },
          });

          useCommunityStore.setState({
            isEnabled: dbEnabled,
            displayName: dbDisplayName,
          });
        }
      } catch (error) {
        console.error('Error syncing community state:', error);
      }
    };

    syncCommunityState();
  }, []); // Empty deps - only run once on mount

  // This component doesn't render anything
  return null;
}
