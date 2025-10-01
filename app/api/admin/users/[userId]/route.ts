import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;

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
      profile,
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