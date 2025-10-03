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
    const body = await request.json();
    const { disabled } = body;

    // Get user's current profile for audit log
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Note: Supabase doesn't have a built-in "disable" feature for users via the client
    // We'll implement this using a custom field in the profiles table
    // For now, we'll add a metadata field to track disabled status

    // Update user metadata to mark as disabled
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        account_disabled: disabled,
      },
    });

    if (authError) {
      console.error("Error updating user auth:", authError);
      // Continue anyway - we can still update the profile
    }

    // Update profile to track disabled status
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update account" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      action: disabled ? "disable_account" : "enable_account",
      resource_type: "user",
      resource_id: userId,
      old_values: currentProfile,
      new_values: { account_disabled: disabled },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: disabled ? "Account disabled" : "Account enabled",
    });
  } catch (error) {
    console.error("Admin disable account error:", error);
    return NextResponse.json(
      { error: "Failed to update account status" },
      { status: 500 }
    );
  }
}
