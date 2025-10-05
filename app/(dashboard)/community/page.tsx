import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { CommunityFeed } from '@/components/community';

export const metadata = {
  title: 'Community | Pocket Philosopher',
  description: 'Discover wisdom from fellow practitioners',
};

export default async function CommunityPage() {
  const supabase = await createSupabaseServerClient();

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if community is enabled for this user
  const { data: profile } = await supabase
    .from('profiles')
    .select('community_enabled, display_name')
    .eq('user_id', session.user.id)
    .single();

  // If community not enabled, redirect to settings
  if (!profile?.community_enabled) {
    redirect('/settings?tab=community');
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <CommunityFeed />
    </div>
  );
}
