import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminAuthMiddleware(request);
    if (authResult) {
      return authResult;
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // No-op for read-only operations
          },
          remove() {
            // No-op for read-only operations
          },
        },
      }
    );

    // Get total metrics
    const [
      { data: userStats },
      { data: purchaseStats },
      { data: conversationStats },
      { data: habitStats },
      { data: reflectionStats },
    ] = await Promise.all([
      supabase.from("profiles").select("id, created_at").order("created_at", { ascending: false }),
      supabase.from("purchases").select("amount, created_at"),
      supabase.from("conversations").select("id, created_at"),
      supabase.from("habits").select("id, created_at"),
      supabase.from("reflections").select("id, created_at"),
    ]);

    // Calculate totals
    const totalUsers = userStats?.length || 0;
    const totalPurchases = purchaseStats?.length || 0;
    const totalRevenue = purchaseStats?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalConversations = conversationStats?.length || 0;
    const totalHabits = habitStats?.length || 0;
    const totalReflections = reflectionStats?.length || 0;

    // Get active users (users who have logged in within the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeUsers } = await supabase
      .from("profiles")
      .select("id")
      .gte("last_sign_in_at", sevenDaysAgo.toISOString());

    // Get weekly trends
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      { data: usersThisWeek },
      { data: purchasesThisWeek },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id")
        .gte("created_at", oneWeekAgo.toISOString()),
      supabase
        .from("purchases")
        .select("amount")
        .gte("created_at", oneWeekAgo.toISOString()),
    ]);

    const usersThisWeekCount = usersThisWeek?.length || 0;
    const purchasesThisWeekCount = purchasesThisWeek?.length || 0;
    const revenueThisWeek = purchasesThisWeek?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Get top content usage
    const { data: topContent } = await supabase
      .from("philosophy_chunks")
      .select("work, author, usage_count")
      .order("usage_count", { ascending: false })
      .limit(10);

    // Get user activity for the last 7 days
    const userActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [
        { data: dailyUsers },
        { data: dailyConversations },
        { data: dailyPurchases },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString()),
        supabase
          .from("conversations")
          .select("id")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString()),
        supabase
          .from("purchases")
          .select("id")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString()),
      ]);

      userActivity.push({
        date: dateStr,
        users: dailyUsers?.length || 0,
        conversations: dailyConversations?.length || 0,
        purchases: dailyPurchases?.length || 0,
      });
    }

    const analyticsData = {
      metrics: {
        totalUsers,
        activeUsers: activeUsers?.length || 0,
        totalPurchases,
        totalRevenue,
        totalConversations,
        totalHabits,
        totalReflections,
      },
      trends: {
        usersThisWeek: usersThisWeekCount,
        purchasesThisWeek: purchasesThisWeekCount,
        revenueThisWeek,
      },
      topContent: topContent || [],
      userActivity,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}