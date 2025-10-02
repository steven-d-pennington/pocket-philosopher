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
    const product = searchParams.get("product") || "all";
    const status = searchParams.get("status") || "all";
    const source = searchParams.get("source") || "all";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("entitlements")
      .select(
        `
        *,
        products:product_id(*),
        profiles:user_id(user_id, preferred_virtue, preferred_persona)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`user_id.ilike.%${search}%`);
    }

    if (product !== "all") {
      query = query.eq("product_id", product);
    }

    if (status !== "all") {
      query = query.eq("is_active", status === "active");
    }

    if (source !== "all") {
      query = query.eq("source", source);
    }

    const { data: entitlements, error, count } = await query;

    if (error) {
      console.error("Error fetching entitlements:", error);
      return NextResponse.json(
        { error: "Failed to fetch entitlements" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      entitlements: entitlements || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin entitlements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entitlements" },
      { status: 500 }
    );
  }
}
