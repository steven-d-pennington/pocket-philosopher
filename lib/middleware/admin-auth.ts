import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function adminAuthMiddleware(request: NextRequest) {
  // Check if admin dashboard is enabled
  if (process.env.ADMIN_DASHBOARD !== "true") {
    return NextResponse.json(
      { error: "Admin dashboard is not enabled" },
      { status: 404 }
    );
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error(`Failed to fetch profile for user ${user.id}:`, profileError);
      return NextResponse.json(
        { error: "Failed to verify admin status" },
        { status: 500 }
      );
    }

    if (!profile.is_admin) {
      console.warn(`Unauthorized admin access attempt by user ${user.id} to ${request.nextUrl.pathname}`);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Check admin session timeout (30 minutes of inactivity)
    const ADMIN_SESSION_TIMEOUT_MINUTES = 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ADMIN_SESSION_TIMEOUT_MINUTES * 60 * 1000);

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
        // Session expired - mark as inactive
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', activeSession.id);

        console.warn(`Admin session expired for user ${user.id} (last activity: ${lastActivity.toISOString()})`);
        return NextResponse.json(
          { error: "Session expired - please log in again" },
          { status: 401 }
        );
      }

      // Update last activity timestamp
      await supabase
        .from('admin_sessions')
        .update({
          last_activity_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', activeSession.id);
    } else {
      // Create new admin session
      const sessionToken = crypto.randomUUID();
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
      const userAgent = request.headers.get('user-agent') || null;

      await supabase
        .from('admin_sessions')
        .insert({
          admin_user_id: user.id,
          session_token: sessionToken,
          ip_address: ipAddress,
          user_agent: userAgent,
          last_activity_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      console.log(`Created new admin session for user ${user.id}`);
    }

    console.log(`Admin access granted: ${request.method} ${request.nextUrl.pathname} for admin user ${user.id}`);

    // User is authenticated and is an admin with valid session
    return null; // Continue to the route
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}