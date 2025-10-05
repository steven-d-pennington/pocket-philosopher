/**
 * Community Post Reaction API Route
 * POST /api/community/posts/[postId]/react - Add/remove reaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { ReactRequest, ReactResponse } from '@/lib/community/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
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
    const body: ReactRequest = await request.json();
    const { action } = body;

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { error: { message: 'Invalid action', code: 'INVALID_ACTION' } },
        { status: 400 }
      );
    }

    // Check if post exists and is visible
    const { data: post } = await supabase
      .from('community_posts')
      .select('id, reaction_count')
      .eq('id', postId)
      .eq('is_visible', true)
      .single();

    if (!post) {
      return NextResponse.json(
        { error: { message: 'Post not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    let user_has_reacted = false;
    let reaction_count = post.reaction_count;

    if (action === 'add') {
      // Add reaction (upsert to handle duplicates)
      const { error } = await supabase
        .from('community_reactions')
        .insert({
          post_id: postId,
          user_id: session.user.id,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Error adding reaction:', error);
        return NextResponse.json(
          { error: { message: 'Failed to add reaction', code: 'REACTION_FAILED' } },
          { status: 500 }
        );
      }

      user_has_reacted = true;
    } else {
      // Remove reaction
      const { error } = await supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error removing reaction:', error);
        return NextResponse.json(
          { error: { message: 'Failed to remove reaction', code: 'REACTION_FAILED' } },
          { status: 500 }
        );
      }

      user_has_reacted = false;
    }

    // Get updated count (trigger should have updated it)
    const { data: updatedPost } = await supabase
      .from('community_posts')
      .select('reaction_count')
      .eq('id', postId)
      .single();

    if (updatedPost) {
      reaction_count = updatedPost.reaction_count;
    }

    const response: ReactResponse = {
      success: true,
      reaction_count: reaction_count ?? 0,
      user_has_reacted,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('React to post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
