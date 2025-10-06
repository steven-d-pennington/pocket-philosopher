/**
 * Admin Community Report Action API Route
 * POST /api/admin/community/reports/[reportId]/action - Take action on a report
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { AdminActionRequest, AdminActionResponse } from '@/lib/community/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const supabase = await createSupabaseServerClient();

    // Check authentication and admin status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: { message: 'Forbidden - Admin access required', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body: AdminActionRequest = await request.json();
    const { action, admin_notes } = body;

    if (!['delete', 'hide', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { error: { message: 'Invalid action', code: 'INVALID_ACTION' } },
        { status: 400 }
      );
    }

    // Get report
    const { data: report, error: reportError } = await supabase
      .from('community_reports')
      .select('*, post:community_posts(*)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: { message: 'Report not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const post = (report as any).post;
    if (!post) {
      return NextResponse.json(
        { error: { message: 'Associated post not found', code: 'POST_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Take action on post
    if (action === 'delete') {
      // Permanently delete post (CASCADE will delete reactions and reports)
      await supabase
        .from('community_posts')
        .delete()
        .eq('id', post.id);
    } else if (action === 'hide') {
      // Hide post but keep for records
      await supabase
        .from('community_posts')
        .update({ is_visible: false })
        .eq('id', post.id);
    }
    // For 'dismiss', we just update the report status

    // Update report status
    await supabase
      .from('community_reports')
      .update({
        status: action === 'dismiss' ? 'dismissed' : 'actioned',
        admin_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
      })
      .eq('id', reportId);

    // TODO: Log to admin_audit_log

    const response: AdminActionResponse = {
      success: true,
      action_taken: action,
      post_id: post.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
