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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build the query with joins
    let query = supabase
      .from("purchases")
      .select(`
        *,
        products:product_id(name),
        profiles:user_id(email)
      `)
      .order("purchase_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (search) {
      // Search in product names, user emails, or purchase IDs
      query = query.or(`
        products.name.ilike.%${search}%,
        profiles.email.ilike.%${search}%,
        id.ilike.%${search}%
      `);
    }

    const { data: purchases, error, count } = await query;

    if (error) {
      console.error("Error fetching purchases:", error);
      return NextResponse.json(
        { error: "Failed to fetch purchases" },
        { status: 500 }
      );
    }

    // Calculate total revenue
    const { data: revenueData } = await supabase
      .from("purchases")
      .select("amount_cents")
      .eq("status", "completed");

    const totalRevenue = revenueData?.reduce((sum, purchase) => sum + purchase.amount_cents, 0) || 0;

    return NextResponse.json({
      purchases: purchases || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      totalRevenue,
    });
  } catch (error) {
    console.error("Admin purchases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}