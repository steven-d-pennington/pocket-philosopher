/**
 * Admin Community Reports API Route
 * GET /api/admin/community/reports - Get reports queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { AdminReportsRequest, AdminReportsResponse, CommunityReportWithPost } from '@/lib/community/types';

export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('community_reports')
      .select(`
        *,
        post:community_posts(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching community reports:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch reports', code: 'FETCH_FAILED' } },
        { status: 500 }
      );
    }

    const response: AdminReportsResponse = {
      reports: reports as any,
      has_more: reports.length === limit + 1,
      total: reports.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
