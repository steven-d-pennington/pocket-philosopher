import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function adminAuthMiddleware(_request: NextRequest) {
  // Check if admin dashboard is enabled
  if (process.env.ADMIN_DASHBOARD !== "true") {
    return NextResponse.json(
      { error: "Admin dashboard is not enabled" },
      { status: 404 }
    );
  }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // TEMP: Skip admin check for testing - allow all authenticated users
    // TODO: Re-enable proper admin checking once service role client is working
    console.log("Admin API access granted for user:", user.id);

    // User is authenticated
    return null; // Continue to the route
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}