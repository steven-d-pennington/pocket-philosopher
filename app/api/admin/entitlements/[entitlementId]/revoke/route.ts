import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entitlementId: string }> }
) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

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

    const { entitlementId } = await params;

    // Get current admin user
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current entitlement for audit log
    const { data: currentEntitlement } = await supabase
      .from("entitlements")
      .select("*")
      .eq("id", entitlementId)
      .single();

    if (!currentEntitlement) {
      return NextResponse.json(
        { error: "Entitlement not found" },
        { status: 404 }
      );
    }

    // Revoke entitlement (set is_active to false)
    const { error: updateError } = await supabase
      .from("entitlements")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entitlementId);

    if (updateError) {
      console.error("Error revoking entitlement:", updateError);
      return NextResponse.json(
        { error: "Failed to revoke entitlement" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      action: "revoke_entitlement",
      resource_type: "entitlement",
      resource_id: entitlementId,
      old_values: currentEntitlement,
      new_values: { is_active: false },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: "Entitlement revoked",
    });
  } catch (error) {
    console.error("Admin revoke entitlement error:", error);
    return NextResponse.json(
      { error: "Failed to revoke entitlement" },
      { status: 500 }
    );
  }
}
