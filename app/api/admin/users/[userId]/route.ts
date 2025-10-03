import { NextRequest, NextResponse } from "next/server";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";
import { createAdminClient } from "@/lib/admin/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

  try {
    // Service role client for admin operations
    const supabase = createAdminClient();
    const { userId } = await params;

    // Get user from auth (to get email)
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (authError || !authData.user) {
      console.error("Error fetching auth user:", authError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's purchases
    const { data: purchases } = await supabase
      .from("purchases")
      .select(`
        *,
        products:product_id(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Get user's entitlements
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select(`
        *,
        products:product_id(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Get user's habits count
    const { count: habitsCount } = await supabase
      .from("habits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get user's reflections count
    const { count: reflectionsCount } = await supabase
      .from("reflections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return NextResponse.json({
      profile: {
        ...profile,
        email: authData.user.email,
      },
      purchases: purchases || [],
      entitlements: entitlements || [],
      stats: {
        habitsCount: habitsCount || 0,
        reflectionsCount: reflectionsCount || 0,
      },
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

  try {
    // Service role client for admin operations
    const supabase = createAdminClient();
    const { userId } = await params;
    const updates = await request.json();

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        preferred_virtue: updates.preferred_virtue,
        preferred_persona: updates.preferred_persona,
        experience_level: updates.experience_level,
        notifications_enabled: updates.notifications_enabled,
        privacy_level: updates.privacy_level,
        is_admin: updates.is_admin,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // TODO: Log admin action to audit log
    // await logAdminAction(supabase, 'update_user', 'user', userId, currentProfile, updatedProfile);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}