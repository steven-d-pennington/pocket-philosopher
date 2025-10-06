import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

async function fetchReports(status?: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { reports: [], isAdmin: false };

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', session.user.id)
    .single();

  const isAdmin = !!profile?.is_admin;
  if (!isAdmin) return { reports: [], isAdmin: false };

  // Join reports with posts
  let query = supabase
    .from('community_reports')
    .select(`
      id, status, created_at, admin_notes,
      post:community_posts(id, display_name, content_type, content_text, created_at, virtue, persona_id)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  const { data: reports } = await query;

  return { reports: reports ?? [], isAdmin: true };
}

function formatDate(dt?: string) {
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function ReportRow({ report }: { report: any }) {
  async function takeAction(action: 'hide' | 'delete' | 'dismiss') {
    'use server';
    const res = await fetch(`/api/admin/community/reports/${report.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    // No redirect; let the client refresh the page.
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Report ID: {report.id}</p>
          <p className="text-xs text-muted-foreground">Status: {report.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={async () => takeAction('hide')}>
            <Button type="submit" variant="outline" size="sm">Hide</Button>
          </form>
          <form action={async () => takeAction('dismiss')}>
            <Button type="submit" variant="ghost" size="sm">Dismiss</Button>
          </form>
          <form action={async () => takeAction('delete')}>
            <Button type="submit" variant="destructive" size="sm">Delete</Button>
          </form>
        </div>
      </div>
      {report.post ? (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">{report.post.display_name} • {report.post.content_type}</p>
          <p className="text-sm whitespace-pre-wrap break-words">{report.post.content_text}</p>
          <p className="text-xs text-muted-foreground">Posted: {formatDate(report.post.created_at)}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-3">Post not found</p>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Admin • Community Reports',
  description: 'Moderate community reports',
};

export default async function AdminCommunityPage({ searchParams }: { searchParams?: { status?: string } }) {
  const activeStatus = (searchParams?.status || 'all').toLowerCase();
  const { reports, isAdmin } = await fetchReports(activeStatus);

  if (!isAdmin) {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'reviewed', label: 'Reviewed' },
              { key: 'dismissed', label: 'Dismissed' },
              { key: 'actioned', label: 'Actioned' },
            ].map((s) => (
              <Link key={s.key} href={`/admin/community${s.key === 'all' ? '' : `?status=${s.key}`}`}>
                <Button variant={activeStatus === s.key ? 'default' : 'outline'} size="sm">
                  {s.label}
                </Button>
              </Link>
            ))}
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports at this time.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((r: any) => (
                <ReportRow key={r.id} report={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
