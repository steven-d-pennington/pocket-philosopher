/**
 * Community Search API Route
 * GET /api/community/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { SearchRequest, SearchResponse, CommunityPostWithReaction } from '@/lib/community/types';

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
    const q = searchParams.get('q');
    const virtue = searchParams.get('virtue') || undefined;
    const persona = searchParams.get('persona') || undefined;
    const content_type = searchParams.get('content_type') || undefined;
    const date_from = searchParams.get('date_from') || undefined;
    const date_to = searchParams.get('date_to') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const end = offset + limit; // inclusive end for limit+1 fetching

    if (!q) {
      return NextResponse.json(
        { error: { message: 'Search query required', code: 'QUERY_REQUIRED' } },
        { status: 400 }
      );
    }

    // Build query with full-text search
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('is_visible', true)
      .textSearch('content_text', q)
      .order('created_at', { ascending: false })
      .range(offset, end);

    // Apply filters
    if (virtue) {
      query = query.eq('virtue', virtue);
    }
    if (persona) {
      query = query.eq('persona_id', persona);
    }
    if (content_type) {
      query = query.eq('content_type', content_type);
    }
    if (date_from) {
      query = query.gte('created_at', new Date(date_from).toISOString());
    }
    if (date_to) {
      query = query.lte('created_at', new Date(date_to).toISOString());
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error searching community posts:', error);
      return NextResponse.json(
        { error: { message: 'Search failed', code: 'SEARCH_FAILED' } },
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

    // Add reaction status
    const postsWithReactions: CommunityPostWithReaction[] = pagePosts.map((post) => ({
      ...(post as any),
      user_has_reacted: reactedPostIds.has(post.id),
    }));

    const response: SearchResponse = {
      posts: postsWithReactions,
      has_more: hasMore,
      total: postsWithReactions.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Community search error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
