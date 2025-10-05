/**
 * Community Post Detail API Route
 * DELETE /api/community/posts/[postId] - Unshare a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export async function DELETE(
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

    // Update post to hide it (soft delete)
    const { data, error } = await supabase
      .from('community_posts')
      .update({ is_visible: false })
      .eq('id', postId)
      .eq('user_id', session.user.id) // Can only delete own posts
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: { message: 'Post not found or unauthorized', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Post removed from community' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
