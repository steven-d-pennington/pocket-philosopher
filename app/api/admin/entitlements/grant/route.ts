import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { user_id, product_id, expires_at, notes } = body;

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: "user_id and product_id are required" },
        { status: 400 }
      );
    }

    // Get current admin user
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if entitlement already exists
    const { data: existing } = await supabase
      .from("entitlements")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    if (existing) {
      // If it exists and is inactive, reactivate it
      if (!existing.is_active) {
        const { error: updateError } = await supabase
          .from("entitlements")
          .update({
            is_active: true,
            expires_at: expires_at || null,
            metadata: { ...existing.metadata, admin_notes: notes, granted_by: adminUser.id },
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error reactivating entitlement:", updateError);
          return NextResponse.json(
            { error: "Failed to reactivate entitlement" },
            { status: 500 }
          );
        }

        // Log admin action
        await supabase.from("admin_audit_log").insert({
          admin_user_id: adminUser.id,
          action: "reactivate_entitlement",
          resource_type: "entitlement",
          resource_id: existing.id,
          old_values: existing,
          new_values: { is_active: true, expires_at },
          metadata: { notes },
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          user_agent: request.headers.get("user-agent"),
        });

        return NextResponse.json({
          success: true,
          message: "Entitlement reactivated",
        });
      } else {
        return NextResponse.json(
          { error: "User already has this entitlement" },
          { status: 409 }
        );
      }
    }

    // Create new entitlement
    const { data: newEntitlement, error: insertError } = await supabase
      .from("entitlements")
      .insert({
        user_id,
        product_id,
        entitlement_type: "coach_access", // All coach personas use this type
        is_active: true,
        source: "manual_grant",
        expires_at: expires_at || null,
        metadata: { admin_notes: notes, granted_by: adminUser.id },
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating entitlement:", insertError);
      return NextResponse.json(
        { error: "Failed to create entitlement" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      action: "grant_entitlement",
      resource_type: "entitlement",
      resource_id: newEntitlement.id,
      new_values: newEntitlement,
      metadata: { notes },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: "Entitlement granted",
      entitlement: newEntitlement,
    });
  } catch (error) {
    console.error("Admin grant entitlement error:", error);
    return NextResponse.json(
      { error: "Failed to grant entitlement" },
      { status: 500 }
    );
  }
}
