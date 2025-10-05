import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if admin dashboard is enabled
  if (process.env.ADMIN_DASHBOARD !== "true") {
    redirect("/today");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    console.warn(`Unauthorized admin page access attempt by user ${user.id}`);
    redirect("/today");
  }

  // Check admin session timeout (30 minutes of inactivity)
  const ADMIN_SESSION_TIMEOUT_MINUTES = 30;
  const now = new Date();

  // TODO: Implement admin session management with admin_sessions table
  // For now, skip session timeout checks
  /*
  // Try to find active admin session
  const { data: activeSession } = await supabase
    .from('admin_sessions')
    .select('id, last_activity_at, expires_at')
    .eq('admin_user_id', user.id)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .single();

  if (activeSession) {
    // Check if session has expired
    const lastActivity = new Date(activeSession.last_activity_at);
    const sessionExpires = new Date(activeSession.expires_at);
    const timeoutThreshold = new Date(now.getTime() - ADMIN_SESSION_TIMEOUT_MINUTES * 60 * 1000);

    if (lastActivity < timeoutThreshold || sessionExpires < now) {
      // Session expired - mark as inactive and redirect
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('id', activeSession.id);

      console.warn(`Admin session expired for user ${user.id} (last activity: ${lastActivity.toISOString()})`);
      redirect("/login");
    }
  }
  */

  console.log("Admin page access granted for admin user:", user.id);

  return <>{children}</>;
}