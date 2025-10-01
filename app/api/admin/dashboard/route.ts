import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";

export async function GET(request: NextRequest) {
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

    // Get dashboard metrics
    const [
      { count: totalUsers },
      { count: totalPurchases },
      { data: recentPurchases },
      { data: recentUsers }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("purchases").select("*", { count: "exact", head: true }),
      supabase.from("purchases")
        .select("*, profiles:user_id(email)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

    const dashboardData = {
      metrics: {
        totalUsers: totalUsers || 0,
        totalPurchases: totalPurchases || 0,
        totalRevenue: 0, // TODO: Calculate from purchases
      },
      recentActivity: {
        purchases: recentPurchases || [],
        users: recentUsers || [],
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}