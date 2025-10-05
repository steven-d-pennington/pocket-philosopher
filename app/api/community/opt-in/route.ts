/**
 * Community Opt-In API Route
 * POST /api/community/opt-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { validateDisplayName, isDisplayNameAvailable } from '@/lib/community/validators';
import type { OptInRequest, OptInResponse } from '@/lib/community/types';

/**
 * GET /api/community/opt-in?check=displayName
 * Check if a display name is available
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get display name from query parameter
    const { searchParams } = new URL(request.url);
    const displayName = searchParams.get('check');

    if (!displayName) {
      return NextResponse.json(
        { error: { message: 'Display name is required', code: 'MISSING_PARAMETER' } },
        { status: 400 }
      );
    }

    // Validate format
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          available: false, 
          error: validation.error 
        },
        { status: 200 }
      );
    }

    // Check availability
    const isAvailable = await isDisplayNameAvailable(displayName, supabase);

    return NextResponse.json(
      { 
        available: isAvailable,
        displayName: displayName.trim()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Display name check error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/opt-in
 * Enable community features for the user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body: OptInRequest = await request.json();
    const { display_name, accept_guidelines } = body;

    // Validate acceptance
    if (!accept_guidelines) {
      return NextResponse.json(
        { error: { message: 'Must accept community guidelines', code: 'GUIDELINES_REQUIRED' } },
        { status: 400 }
      );
    }

    // Validate display name
    const validation = validateDisplayName(display_name);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: { message: validation.error, code: 'INVALID_DISPLAY_NAME' } },
        { status: 400 }
      );
    }

    // Check availability
    const isAvailable = await isDisplayNameAvailable(display_name, supabase);
    if (!isAvailable) {
      return NextResponse.json(
        { error: { message: 'Display name is already taken', code: 'DISPLAY_NAME_TAKEN' } },
        { status: 400 }
      );
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: display_name.trim(),
        community_enabled: true,
        community_onboarded_at: new Date().toISOString(),
      } as any) // Type assertion needed until Supabase types are regenerated
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error enabling community:', error);
      return NextResponse.json(
        { error: { message: 'Failed to enable community', code: 'UPDATE_FAILED' } },
        { status: 500 }
      );
    }

    const response: OptInResponse = {
      success: true,
      display_name: (data as any).display_name!,
      community_enabled: (data as any).community_enabled!,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Community opt-in error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
