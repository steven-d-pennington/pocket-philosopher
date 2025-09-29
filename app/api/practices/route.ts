import { z } from "zod";

import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";
import { serverAnalytics } from "@/lib/analytics/server";
import { sanitizeNullableText, sanitizeUserText } from "@/lib/security/sanitize";
import type { Database } from "@/lib/supabase/types";

const ROUTE = "/api/practices";

const basePracticeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  virtue: z.string().min(1),
  tracking_type: z.string().optional(),
  target_value: z.number().nullable().optional(),
  difficulty_level: z.string().optional(),
  frequency: z.string().default("daily"),
  active_days: z.array(z.number()).optional(),
  reminder_time: z.string().optional(),
  sort_order: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const createPracticeSchema = basePracticeSchema;

const completePracticeSchema = z.object({
  action: z.literal("complete_practice"),
  practice_id: z.string().uuid(),
  date: z.string().optional(),
  value: z.number().nullable().optional(),
  target_value: z.number().nullable().optional(),
  completed: z.boolean().default(true),
  notes: z.string().optional(),
  mood_before: z.string().optional(),
  mood_after: z.string().optional(),
  difficulty_felt: z.string().optional(),
});

const createPracticeActionSchema = z.object({
  action: z.literal("create"),
  practice: createPracticeSchema,
});

const reorderPracticesSchema = z.object({
  action: z.literal("reorder"),
  order: z
    .array(
      z.object({
        id: z.string().uuid(),
        sort_order: z.number().int(),
      }),
    )
    .min(1),
});

const practicePostSchema = z.discriminatedUnion("action", [
  createPracticeActionSchema,
  reorderPracticesSchema,
  completePracticeSchema,
]);

const updatePracticeSchema = basePracticeSchema.partial().extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

const deletePracticeSchema = z.object({
  id: z.string().uuid(),
});

type PracticeRow = Database["public"]["Tables"]["habits"]["Row"];

type CompletePracticePayload = z.infer<typeof completePracticeSchema>;

const PRACTICE_TEXT_MAX = 2048;

function sanitizePracticeStrings<T extends Record<string, unknown>>(input: T) {
  return {
    ...input,
    name:
      "name" in input && typeof input.name === "string"
        ? sanitizeUserText(input.name, { maxLength: 120 })
        : input.name,
    description:
      "description" in input
        ? sanitizeNullableText(input.description as string | null | undefined, { maxLength: PRACTICE_TEXT_MAX })
        : input.description,
    virtue:
      "virtue" in input && typeof input.virtue === "string"
        ? sanitizeUserText(input.virtue, { maxLength: 120 })
        : input.virtue,
    tracking_type:
      "tracking_type" in input && typeof input.tracking_type === "string"
        ? sanitizeUserText(input.tracking_type, { maxLength: 120 })
        : input.tracking_type,
    difficulty_level:
      "difficulty_level" in input && typeof input.difficulty_level === "string"
        ? sanitizeUserText(input.difficulty_level, { maxLength: 120 })
        : input.difficulty_level,
    frequency:
      "frequency" in input && typeof input.frequency === "string"
        ? sanitizeUserText(input.frequency, { maxLength: 120 })
        : input.frequency,
    reminder_time:
      "reminder_time" in input && typeof input.reminder_time === "string"
        ? sanitizeUserText(input.reminder_time, { maxLength: 32 })
        : input.reminder_time,
  } as T;
}

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to practices", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "active";
  const virtue = searchParams.get("virtue");

  let query = supabase.from("habits").select("*").eq("user_id", user.id);

  if (status === "archived") {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
  }

  if (virtue) {
    query = query.eq("virtue", virtue);
  }

  query = query.order("sort_order", { ascending: true });

  const { data, error: dbError } = await query;

  if (dbError) {
    logger.error("Failed to fetch practices", dbError, { status, virtue });
    return respondWithError(logger, "Failed to load practices", { status: 500 });
  }

  logger.info("Practices retrieved", { count: data?.length ?? 0, status, virtue });
  return respondWithSuccess<{ practices: PracticeRow[] }>(logger, { practices: data ?? [] });
}

export async function POST(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to practices", { method: "POST" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = practicePostSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid practice payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;

  if (payload.action === "create") {
    const practiceInput = sanitizePracticeStrings(payload.practice);

    if (!practiceInput.name || !practiceInput.virtue) {
      logger.warn("Sanitized practice input invalid", { practiceName: payload.practice?.name });
      return respondWithError(logger, "Invalid practice content", { status: 400 });
    }

    const { data, error: insertError } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: practiceInput.name,
        description: practiceInput.description ?? null,
        virtue: practiceInput.virtue,
        tracking_type: practiceInput.tracking_type ?? null,
        target_value: practiceInput.target_value ?? null,
        difficulty_level: practiceInput.difficulty_level ?? null,
        frequency: practiceInput.frequency ?? "daily",
        active_days: practiceInput.active_days ?? null,
        reminder_time: practiceInput.reminder_time ?? null,
        sort_order: practiceInput.sort_order ?? 0,
        metadata: practiceInput.metadata ?? {},
      })
      .select("*")
      .single();

    if (insertError) {
      logger.error("Failed to create practice", insertError);
      return respondWithError(logger, "Failed to create practice", { status: 500 });
    }

    serverAnalytics.capture({
      event: "practice_created",
      distinctId: user.id,
      properties: {
        practice_id: data?.id,
        virtue: data?.virtue,
        frequency: data?.frequency,
        has_reminder: Boolean(data?.reminder_time),
      },
    });

    logger.info("Practice created", { practiceId: data?.id, virtue: data?.virtue });
    return respondWithSuccess(logger, data, { status: 201 });
  }

  if (payload.action === "reorder") {
    for (const item of payload.order) {
      const { error: updateError } = await supabase
        .from("habits")
        .update({ sort_order: item.sort_order })
        .eq("user_id", user.id)
        .eq("id", item.id);

      if (updateError) {
        logger.error("Failed to update practice order", updateError);
        return respondWithError(logger, "Failed to reorder practices", { status: 500 });
      }
    }

    serverAnalytics.capture({
      event: "practice_reordered",
      distinctId: user.id,
      properties: {
        order_size: payload.order.length,
      },
    });

    logger.info("Practices reordered", { count: payload.order.length });
    return respondWithSuccess(logger, { order: payload.order });
  }

  const completionPayload = payload as CompletePracticePayload;

  const { data, error: logError } = await supabase
    .from("habit_logs")
    .upsert(
      {
        user_id: user.id,
        habit_id: completionPayload.practice_id,
        date: completionPayload.date ?? new Date().toISOString().slice(0, 10),
        value: completionPayload.value ?? null,
        target_value: completionPayload.target_value ?? null,
        notes: sanitizeNullableText(completionPayload.notes, { maxLength: PRACTICE_TEXT_MAX }),
        mood_before: sanitizeNullableText(completionPayload.mood_before, { maxLength: 120 }),
        mood_after: sanitizeNullableText(completionPayload.mood_after, { maxLength: 120 }),
        difficulty_felt: sanitizeNullableText(completionPayload.difficulty_felt, { maxLength: 120 }),
      },
      { onConflict: "user_id,habit_id,date" },
    )
    .select("habit_id, date")
    .single();

  if (logError) {
    logger.error("Failed to log practice", logError, { practiceId: completionPayload.practice_id });
    return respondWithError(logger, "Failed to log practice", { status: 500 });
  }

  serverAnalytics.capture({
    event: "practice_completed",
    distinctId: user.id,
    properties: {
      practice_id: data?.habit_id,
      date: data?.date,
      has_notes: Boolean(completionPayload.notes),
      mood_before: completionPayload.mood_before,
      mood_after: completionPayload.mood_after,
      value: completionPayload.value ?? null,
      target_value: completionPayload.target_value ?? null,
    },
  });

  logger.info("Practice completion toggled", {
    practiceId: data?.habit_id,
    completed: completionPayload.completed ?? true,
    date: data?.date,
  });

  return respondWithSuccess(logger, {
    practice_id: data.habit_id,
    completed: true,
    date: data.date,
  });
}

export async function PUT(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to practices", { method: "PUT" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = updatePracticeSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid practice update payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { id, ...rawUpdates } = parseResult.data;
  const updates = sanitizePracticeStrings(rawUpdates);

  if (updates.name !== undefined && !updates.name) {
    logger.warn("Practice update sanitised to empty name", { id });
    return respondWithError(logger, "Invalid practice name", { status: 400 });
  }

  if (updates.virtue !== undefined && !updates.virtue) {
    logger.warn("Practice update sanitised to empty virtue", { id });
    return respondWithError(logger, "Invalid practice virtue", { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("habits")
    .update(updates)
    .eq("user_id", user.id)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    logger.error("Failed to update practice", updateError, { id });
    return respondWithError(logger, "Failed to update practice", { status: 500 });
  }

  serverAnalytics.capture({
    event: "practice_updated",
    distinctId: user.id,
    properties: {
      practice_id: id,
      updated_fields: Object.keys(updates),
    },
  });

  logger.info("Practice updated", { id, fields: Object.keys(updates) });
  return respondWithSuccess(logger, data);
}

export async function DELETE(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to practices", { method: "DELETE" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = deletePracticeSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid practice delete payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { id } = parseResult.data;

  const { error: deleteError } = await supabase
    .from("habits")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (deleteError) {
    logger.error("Failed to delete practice", deleteError, { id });
    return respondWithError(logger, "Failed to delete practice", { status: 500 });
  }

  serverAnalytics.capture({
    event: "practice_deleted",
    distinctId: user.id,
    properties: {
      practice_id: id,
    },
  });

  logger.info("Practice deleted", { id });
  return respondWithSuccess(logger, { id });
}

