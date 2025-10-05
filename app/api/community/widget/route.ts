/**
 * Community Widget API Route
 * GET /api/community/widget - Get personalized posts for Today page widget
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { getUserContext, getWidgetPosts } from '@/lib/community/scoring';
import type { WidgetResponse, CommunityPostWithReaction } from '@/lib/community/types';

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

    // Fetch recent visible posts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: posts, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('is_visible', true)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20); // Get top 20 to select from

    if (error) {
      console.error('Error fetching widget posts:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch widget posts', code: 'FETCH_FAILED' } },
        { status: 500 }
      );
    }

    // Get user context and select top 5 posts
    const userContext = await getUserContext(session.user.id);
    const selectedPosts = getWidgetPosts(posts as any, userContext, 5);

    // Get user's reactions
    const postIds = selectedPosts.map((p) => p.id);
    const { data: userReactions } = await supabase
      .from('community_reactions')
      .select('post_id')
      .eq('user_id', session.user.id)
      .in('post_id', postIds);

    const reactedPostIds = new Set(userReactions?.map((r) => r.post_id) || []);

    // Add reaction status
    const postsWithReactions: CommunityPostWithReaction[] = selectedPosts.map((post) => ({
      ...post,
      user_has_reacted: reactedPostIds.has(post.id),
    }));

    const response: WidgetResponse = {
      posts: postsWithReactions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Community widget error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
