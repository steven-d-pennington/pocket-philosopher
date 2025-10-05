/**
 * Community Posts API Route
 * POST /api/community/posts - Share a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { validateShareRequest } from '@/lib/community/validators';
import type { SharePostRequest, SharePostResponse } from '@/lib/community/types';

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

    // Check if user has community enabled
    const { data: profile } = await supabase
      .from('profiles')
      .select('community_enabled, display_name')
      .eq('user_id', session.user.id)
      .single();

    if (!profile?.community_enabled) {
      return NextResponse.json(
        { error: { message: 'Community not enabled', code: 'COMMUNITY_DISABLED' } },
        { status: 403 }
      );
    }

    if (!profile.display_name) {
      return NextResponse.json(
        { error: { message: 'Display name required', code: 'NO_DISPLAY_NAME' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body: SharePostRequest = await request.json();

    // Validate request
    const validation = validateShareRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: { message: validation.error, code: 'INVALID_REQUEST' } },
        { status: 400 }
      );
    }

    // Extract original date from metadata if available
    let original_date = new Date().toISOString().split('T')[0];
    
    // Create post
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: session.user.id,
        display_name: profile.display_name,
        content_type: body.content_type,
        content_text: body.content_text,
        content_metadata: body.content_metadata as any,
        source_id: body.source_id,
        source_table: body.source_table,
        virtue: (body.content_metadata as any).virtue || null,
        persona_id: (body.content_metadata as any).persona_id || null,
        share_method: body.share_method || null,
        is_visible: true,
        reaction_count: 0,
        original_date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating community post:', error);
      return NextResponse.json(
        { error: { message: 'Failed to create post', code: 'CREATE_FAILED' } },
        { status: 500 }
      );
    }

    const response: SharePostResponse = {
      success: true,
      post: post as any,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Share post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
