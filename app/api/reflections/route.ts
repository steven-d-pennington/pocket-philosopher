import { z } from "zod";

import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/reflections";

const baseReflectionSchema = z.object({
  date: z.string().min(1),
  type: z.enum(["morning", "midday", "evening"]),
  virtue_focus: z.string().optional(),
  intention: z.string().optional(),
  lesson: z.string().optional(),
  gratitude: z.string().optional(),
  challenge: z.string().optional(),
  mood: z.number().int().min(0).max(10).nullable().optional(),
  journal_entry: z.string().optional(),
  key_insights: z.array(z.string()).optional(),
  challenges_faced: z.array(z.string()).optional(),
  wins_celebrated: z.array(z.string()).optional(),
});

const createReflectionSchema = baseReflectionSchema;

const updateReflectionSchema = baseReflectionSchema.partial().extend({
  id: z.string().uuid(),
});

const deleteReflectionSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to reflections", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("date");

  let query = supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (targetDate) {
    query = query.eq("date", targetDate);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    logger.error("Failed to fetch reflections", dbError, { targetDate });
    return respondWithError(logger, "Failed to load reflections", { status: 500 });
  }

  logger.info("Reflections retrieved", { count: data?.length ?? 0, targetDate });
  return respondWithSuccess(logger, { reflections: data ?? [] });
}

export async function POST(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to reflections", { method: "POST" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = createReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid reflection payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;

  const { data, error: insertError } = await supabase
    .from("reflections")
    .upsert(
      {
        ...payload,
        user_id: user.id,
      },
      { onConflict: "user_id,date,type" },
    )
    .select("*")
    .single();

  if (insertError) {
    logger.error("Failed to save reflection", insertError, {
      date: payload.date,
      type: payload.type,
    });
    return respondWithError(logger, "Failed to save reflection", { status: 500 });
  }

  logger.info("Reflection saved", { date: payload.date, type: payload.type });
  return respondWithSuccess(logger, data, { status: 201 });
}

export async function PUT(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to reflections", { method: "PUT" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = updateReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid reflection update payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { id, ...updates } = parseResult.data;

  const { data, error: updateError } = await supabase
    .from("reflections")
    .update(updates)
    .eq("user_id", user.id)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    logger.error("Failed to update reflection", updateError, { id });
    return respondWithError(logger, "Failed to update reflection", { status: 500 });
  }

  logger.info("Reflection updated", { id });
  return respondWithSuccess(logger, data);
}

export async function DELETE(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to reflections", { method: "DELETE" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = deleteReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid reflection delete payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { id } = parseResult.data;

  const { error: deleteError } = await supabase
    .from("reflections")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (deleteError) {
    logger.error("Failed to delete reflection", deleteError, { id });
    return respondWithError(logger, "Failed to delete reflection", { status: 500 });
  }

  logger.info("Reflection deleted", { id });
  return respondWithSuccess(logger, { id });
}
