import { z } from "zod";

import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/daily-progress";

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_intention"),
    date: z.string().optional(),
    intention: z.string().min(1),
  }),
  z.object({
    action: z.literal("complete_practice"),
    practice_id: z.string().uuid(),
    date: z.string().optional(),
    completed: z.boolean().default(true),
  }),
]);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to daily progress", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("date") ?? todayISO();

  const { data: progressRow, error: progressError } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", targetDate)
    .maybeSingle();

  if (progressError && progressError.code !== "PGRST116") {
    logger.error("Failed to fetch daily progress", progressError, { targetDate });
    return respondWithError(logger, "Failed to load daily progress", { status: 500 });
  }

  let workingProgress = progressRow;

  if (!workingProgress) {
    const { data: inserted, error: insertError } = await supabase
      .from("daily_progress")
      .insert({ user_id: user.id, date: targetDate })
      .select("*")
      .single();

    if (insertError) {
      logger.error("Failed to seed daily progress", insertError, { targetDate });
      return respondWithError(logger, "Failed to initialize daily progress", { status: 500 });
    }

    workingProgress = inserted;
  }

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("date", targetDate);

  if (logsError) {
    logger.error("Failed to load practice logs", logsError, { targetDate });
    return respondWithError(logger, "Failed to load practice logs", { status: 500 });
  }

  const { data: reflections, error: reflectionsError } = await supabase
    .from("reflections")
    .select("type")
    .eq("user_id", user.id)
    .eq("date", targetDate);

  if (reflectionsError) {
    logger.error("Failed to load reflections", reflectionsError, { targetDate });
    return respondWithError(logger, "Failed to load reflections", { status: 500 });
  }

  const responsePayload = {
    date: targetDate,
    intention: workingProgress.morning_intention,
    practicesCompleted: logs?.map((log) => log.habit_id) ?? [],
    virtueScores: {
      wisdom: workingProgress.wisdom_score,
      justice: workingProgress.justice_score,
      temperance: workingProgress.temperance_score,
      courage: workingProgress.courage_score,
    },
    returnScore: workingProgress.return_score,
    streakDays: workingProgress.streak_days ?? 0,
    reflections: {
      morning: reflections?.some((item) => item.type === "morning") ?? false,
      midday: reflections?.some((item) => item.type === "midday") ?? false,
      evening: reflections?.some((item) => item.type === "evening") ?? false,
    },
  };

  logger.info("Daily progress retrieved", { targetDate });
  return respondWithSuccess(logger, responsePayload);
}

export async function POST(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to daily progress", { method: "POST" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = postSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid daily progress payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;
  const targetDate = payload.date ?? todayISO();

  const action = payload.action;

  switch (action) {
    case "set_intention": {
      const { error: upsertError } = await supabase.from("daily_progress").upsert(
        {
          user_id: user.id,
          date: targetDate,
          morning_intention: payload.intention,
        },
        { onConflict: "user_id,date" },
      );

      if (upsertError) {
        logger.error("Failed to set intention", upsertError, { targetDate });
        return respondWithError(logger, "Failed to set intention", { status: 500 });
      }

      logger.info("Daily intention set", { targetDate });
      return respondWithSuccess(logger, { date: targetDate, intention: payload.intention });
    }
    case "complete_practice": {
      if (payload.completed) {
        const { error: insertError } = await supabase.from("habit_logs").upsert(
          {
            user_id: user.id,
            habit_id: payload.practice_id,
            date: targetDate,
          },
          { onConflict: "user_id,habit_id,date" },
        );

        if (insertError) {
          logger.error("Failed to log practice completion", insertError, {
            targetDate,
            practiceId: payload.practice_id,
          });
          return respondWithError(logger, "Failed to log practice", { status: 500 });
        }
      } else {
        const { error: deleteError } = await supabase
          .from("habit_logs")
          .delete()
          .eq("user_id", user.id)
          .eq("habit_id", payload.practice_id)
          .eq("date", targetDate);

        if (deleteError) {
          logger.error("Failed to remove practice log", deleteError, {
            targetDate,
            practiceId: payload.practice_id,
          });
          return respondWithError(logger, "Failed to update practice log", { status: 500 });
        }
      }

      logger.info("Practice completion recorded", {
        targetDate,
        practiceId: payload.practice_id,
        completed: payload.completed,
      });

      return respondWithSuccess(logger, {
        practice_id: payload.practice_id,
        completed: payload.completed,
        date: targetDate,
      });
    }
    default:
      logger.warn("Unsupported daily progress action", { action });
      return respondWithError(logger, "Unsupported action", { status: 400 });
  }
}

