import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";
import { createAdminClient } from "@/lib/admin/supabase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

  try {
    const cookieStore = await cookies();

    // Get admin user from session
    const sessionSupabase = createServerClient(
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

    const {
      data: { user: adminUser },
    } = await sessionSupabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for admin operations
    const supabase = createAdminClient();
    const { userId } = await params;

    // Get user's email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (userError || !userData.user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = userData.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User has no email address" },
        { status: 400 }
      );
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (resetError) {
      console.error("Error sending reset email:", resetError);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      action: "reset_password",
      resource_type: "user",
      resource_id: userId,
      metadata: { email: userEmail },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
      email: userEmail,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
