import { NextRequest, NextResponse } from "next/server";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";
import { createAdminClient } from "@/lib/admin/supabase-admin";

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

  try {
    // Service role client for admin operations
    const supabase = createAdminClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // First, get all users from auth with pagination
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const authUsers = authData.users;
    const userIds = authUsers.map((u) => u.id);

    // Get profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
    }

    // Combine auth data with profile data
    const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    let usersWithEmail = authUsers.map((authUser) => {
      const profile = profilesMap.get(authUser.id);
      return {
        user_id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        ...profile,
      };
    });

    // Apply search filter if provided
    if (search) {
      usersWithEmail = usersWithEmail.filter((user) => {
        const searchLower = search.toLowerCase();
        return (
          user.email?.toLowerCase().includes(searchLower) ||
          user.preferred_virtue?.toLowerCase().includes(searchLower) ||
          user.preferred_persona?.toLowerCase().includes(searchLower) ||
          user.experience_level?.toLowerCase().includes(searchLower)
        );
      });
    }

    return NextResponse.json({
      users: usersWithEmail,
      pagination: {
        page,
        limit,
        total: authData.total || usersWithEmail.length,
        totalPages: Math.ceil((authData.total || usersWithEmail.length) / limit),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}