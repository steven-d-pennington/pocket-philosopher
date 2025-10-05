import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ practiceId: string }> }
) {
  const { practiceId } = await context.params;
  
  try {
    const supabase = await createSupabaseServerClient();

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    // Calculate current streak for this practice
    // Get all habit logs for this practice, ordered by date descending
    const { data: logs, error } = await supabase
      .from("habit_logs")
      .select("date")
      .eq("habit_id", practiceId)
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Failed to fetch habit logs:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch streak data", code: "DATABASE_ERROR" } },
        { status: 500 }
      );
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ streak: 0, totalCompletions: 0 });
    }

    // Calculate streak (consecutive days)
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const completionDates = new Set(
      logs.map((log: { date: string }) => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Check if completed today or yesterday to start streak
    const today = currentDate.getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;

    if (!completionDates.has(today) && !completionDates.has(yesterday)) {
      // Streak is broken
      return NextResponse.json({ streak: 0, totalCompletions: logs.length });
    }

    // Count consecutive days backwards from today/yesterday
    let checkDate = completionDates.has(today) ? today : yesterday;
    
    while (completionDates.has(checkDate)) {
      streak++;
      checkDate -= 24 * 60 * 60 * 1000; // Go back one day
    }

    return NextResponse.json({ 
      streak, 
      totalCompletions: logs.length,
      lastCompleted: logs[0].date
    });
  } catch (error) {
    console.error("Streak calculation error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
