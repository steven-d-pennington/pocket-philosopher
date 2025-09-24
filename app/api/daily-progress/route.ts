import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_intention"),
    date: z.string().optional(),
    intention: z.string().min(1),
  }),
  z.object({
    action: z.literal("complete_habit"),
    habit_id: z.string().uuid(),
    date: z.string().optional(),
    completed: z.boolean().default(true),
  }),
]);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
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
    console.error("Failed to fetch daily progress", progressError);
    return error("Failed to load daily progress", { status: 500 });
  }

  let workingProgress = progressRow;

  if (!workingProgress) {
    const { data: inserted, error: insertError } = await supabase
      .from("daily_progress")
      .insert({ user_id: user.id, date: targetDate })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to seed daily progress", insertError);
      return error("Failed to initialize daily progress", { status: 500 });
    }

    workingProgress = inserted;
  }

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("date", targetDate);

  if (logsError) {
    console.error("Failed to load habit logs", logsError);
    return error("Failed to load habit logs", { status: 500 });
  }

  const { data: reflections, error: reflectionsError } = await supabase
    .from("reflections")
    .select("type")
    .eq("user_id", user.id)
    .eq("date", targetDate);

  if (reflectionsError) {
    console.error("Failed to load reflections", reflectionsError);
    return error("Failed to load reflections", { status: 500 });
  }

  const responsePayload = {
    date: targetDate,
    intention: workingProgress.morning_intention,
    habitsCompleted: logs?.map((log) => log.habit_id) ?? [],
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

  return success(responsePayload);
}

export async function POST(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = postSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;
  const targetDate = payload.date ?? todayISO();

  switch (payload.action) {
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
        console.error("Failed to set intention", upsertError);
        return error("Failed to set intention", { status: 500 });
      }

      return success({ date: targetDate, intention: payload.intention });
    }
    case "complete_habit": {
      if (payload.completed) {
        const { error: insertError } = await supabase.from("habit_logs").upsert(
          {
            user_id: user.id,
            habit_id: payload.habit_id,
            date: targetDate,
          },
          { onConflict: "user_id,habit_id,date" },
        );

        if (insertError) {
          console.error("Failed to log habit completion", insertError);
          return error("Failed to log habit", { status: 500 });
        }
      } else {
        const { error: deleteError } = await supabase
          .from("habit_logs")
          .delete()
          .eq("user_id", user.id)
          .eq("habit_id", payload.habit_id)
          .eq("date", targetDate);

        if (deleteError) {
          console.error("Failed to remove habit log", deleteError);
          return error("Failed to update habit log", { status: 500 });
        }
      }

      return success({
        habit_id: payload.habit_id,
        completed: payload.completed,
        date: targetDate,
      });
    }
    default:
      return error("Unsupported action", { status: 400 });
  }
}
