/**
 * Community Post Report API Route
 * POST /api/community/posts/[postId]/report - Report a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { ReportRequest, ReportResponse } from '@/lib/community/types';

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

    // Check if post exists and is visible
    const { data: post } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .eq('is_visible', true)
      .single();

    if (!post) {
      return NextResponse.json(
        { error: { message: 'Post not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Can't report own posts
    if (post.user_id === session.user.id) {
      return NextResponse.json(
        { error: { message: 'Cannot report your own post', code: 'CANNOT_REPORT_OWN' } },
        { status: 400 }
      );
    }

    // Check if already reported by this user
    const { data: existingReport } = await supabase
      .from('community_reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reporter_user_id', session.user.id)
      .maybeSingle();

    if (existingReport) {
      return NextResponse.json(
        { error: { message: 'Already reported', code: 'ALREADY_REPORTED' } },
        { status: 400 }
      );
    }

    // Create report
    const { error } = await supabase
      .from('community_reports')
      .insert({
        post_id: postId,
        reporter_user_id: session.user.id,
        status: 'pending',
      });

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json(
        { error: { message: 'Failed to submit report', code: 'REPORT_FAILED' } },
        { status: 500 }
      );
    }

    const response: ReportResponse = {
      success: true,
      message: 'Report submitted for review',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Report post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
