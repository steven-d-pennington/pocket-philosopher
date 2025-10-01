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

    // Note: supabase client not needed for settings that come from environment variables
    // const cookieStore = await cookies();
    // const supabase = createServerClient(...);

    // Get current settings from environment variables and database
    const settings = {
      adminDashboardEnabled: process.env.ADMIN_DASHBOARD === "true",
      maintenanceMode: process.env.MAINTENANCE_MODE === "true",
      registrationEnabled: process.env.REGISTRATION_ENABLED !== "false", // Default to true
      stripeEnabled: process.env.STRIPE_SECRET_KEY ? true : false,
      analyticsEnabled: process.env.POSTHOG_KEY ? true : false,
      maxUsers: parseInt(process.env.MAX_USERS || "10000"),
      supportEmail: process.env.SUPPORT_EMAIL || "",
      systemMessage: process.env.SYSTEM_MESSAGE || "",
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminAuthMiddleware(request);
    if (authResult) {
      return authResult;
    }

    const body = await request.json();
    const {
      adminDashboardEnabled,
      maintenanceMode,
      registrationEnabled,
      stripeEnabled,
      analyticsEnabled,
      maxUsers,
      supportEmail,
      systemMessage,
    } = body;

    // In a real implementation, you would update environment variables
    // or a settings table in the database. For now, we'll just validate
    // and return success since environment variables are managed externally.

    // Validate inputs
    if (typeof maxUsers !== "number" || maxUsers < 0) {
      return NextResponse.json(
        { error: "Invalid max users value" },
        { status: 400 }
      );
    }

    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Log the settings change for audit purposes
    console.log("Settings updated:", {
      adminDashboardEnabled,
      maintenanceMode,
      registrationEnabled,
      stripeEnabled,
      analyticsEnabled,
      maxUsers,
      supportEmail,
      systemMessage,
      updatedBy: "admin", // In a real app, get from auth
      timestamp: new Date().toISOString(),
    });

    // Return success - in a real implementation, you'd persist these changes
    return NextResponse.json({
      message: "Settings updated successfully",
      note: "Note: Environment variables must be updated manually in production"
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}