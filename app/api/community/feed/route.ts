/**
 * Community Feed API Route
 * GET /api/community/feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { getUserContext, sortFeedPosts, applyFilters } from '@/lib/community/scoring';
import type { FeedRequest, FeedResponse, CommunityPost, CommunityPostWithReaction } from '@/lib/community/types';

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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get('mode') as 'for_you' | 'recent') || 'for_you';
    const virtue = searchParams.get('virtue') || undefined;
    const persona = searchParams.get('persona') || undefined;
    const content_type = searchParams.get('content_type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const end = offset + limit; // inclusive end for limit+1 fetching

    // Fetch posts from database
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(offset, end);

    // Apply filters if provided
    if (virtue) {
      query = query.eq('virtue', virtue);
    }
    if (persona) {
      query = query.eq('persona_id', persona);
    }
    if (content_type) {
      query = query.eq('content_type', content_type);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching community feed:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch feed', code: 'FETCH_FAILED' } },
        { status: 500 }
      );
    }

    // Get user's reactions
    const hasMore = (posts?.length || 0) > limit;
    const pagePosts = (posts || []).slice(0, limit);

    const postIds = pagePosts.map((p) => p.id);
    const { data: userReactions } = await supabase
      .from('community_reactions')
      .select('post_id')
      .eq('user_id', session.user.id)
      .in('post_id', postIds);

    const reactedPostIds = new Set(userReactions?.map((r) => r.post_id) || []);

    // Add reaction status to posts
    const postsWithReactions: CommunityPostWithReaction[] = pagePosts.map((post) => ({
      ...(post as any),
      user_has_reacted: reactedPostIds.has(post.id),
    }));

    // Sort posts based on mode
    let sortedPosts = postsWithReactions;
    if (mode === 'for_you') {
      const userContext = await getUserContext(session.user.id);
      sortedPosts = sortFeedPosts(postsWithReactions as any, userContext) as any;
    }

    const response: FeedResponse = {
      posts: sortedPosts,
      has_more: hasMore,
      total: sortedPosts.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Community feed error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
