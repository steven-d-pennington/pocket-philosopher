import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/progress";

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to progress", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const { data: summaries, error: summariesError } = await supabase
    .from("progress_summaries")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .limit(8);

  if (summariesError) {
    logger.error("Failed to fetch progress summaries", summariesError);
    return respondWithError(logger, "Failed to load progress summaries", { status: 500 });
  }

  const { data: recentDaily, error: dailyError } = await supabase
    .from("daily_progress")
    .select("date, return_score, habits_completed, completion_rate")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(14);

  if (dailyError) {
    logger.error("Failed to fetch daily progress list", dailyError);
    return respondWithError(logger, "Failed to load daily progress", { status: 500 });
  }

  const daily = (recentDaily ?? []).map(({ habits_completed, ...rest }) => ({
    ...rest,
    practices_completed: habits_completed,
  }));

  logger.info("Progress summary retrieved", {
    summaryCount: summaries?.length ?? 0,
    dailyCount: daily.length,
  });

  return respondWithSuccess(logger, { summaries: summaries ?? [], daily });
}
