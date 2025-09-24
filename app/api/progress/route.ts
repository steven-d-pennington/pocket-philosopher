import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

export async function GET() {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const { data: summaries, error: summariesError } = await supabase
    .from("progress_summaries")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .limit(8);

  if (summariesError) {
    console.error("Failed to fetch progress summaries", summariesError);
    return error("Failed to load progress summaries", { status: 500 });
  }

  const { data: recentDaily, error: dailyError } = await supabase
    .from("daily_progress")
    .select("date, return_score, habits_completed, completion_rate")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(14);

  if (dailyError) {
    console.error("Failed to fetch daily progress list", dailyError);
    return error("Failed to load daily progress", { status: 500 });
  }

  return success({ summaries: summaries ?? [], daily: recentDaily ?? [] });
}
