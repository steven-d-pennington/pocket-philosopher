import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";
import type { Database } from "@/lib/supabase/types";

const baseHabitSchema = z.object({
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
  tags: z.array(z.string()).optional(),
});

const createHabitSchema = baseHabitSchema;

const logHabitSchema = z.object({
  action: z.literal("log"),
  habit_id: z.string().uuid(),
  date: z.string().optional(),
  value: z.number().nullable().optional(),
  target_value: z.number().nullable().optional(),
  notes: z.string().optional(),
  mood_before: z.string().optional(),
  mood_after: z.string().optional(),
  difficulty_felt: z.string().optional(),
});

const createHabitActionSchema = z.object({
  action: z.literal("create"),
  habit: createHabitSchema,
});

const habitPostSchema = z.discriminatedUnion("action", [createHabitActionSchema, logHabitSchema]);

const updateHabitSchema = baseHabitSchema.partial().extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

const deleteHabitSchema = z.object({
  id: z.string().uuid(),
});

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];

type HabitLogRow = Database["public"]["Tables"]["habit_logs"]["Row"];

export async function GET(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
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
    console.error("Failed to fetch habits", dbError);
    return error("Failed to load habits", { status: 500 });
  }

  return success<{ habits: HabitRow[] }>({ habits: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = habitPostSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;

  if (payload.action === "create") {
    const habitInput = payload.habit;
    const { data, error: insertError } = await supabase
      .from("habits")
      .insert({
        ...habitInput,
        user_id: user.id,
        active_days: habitInput.active_days ?? [1, 2, 3, 4, 5, 6, 7],
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to create habit", insertError);
      return error("Failed to create habit", { status: 500 });
    }

    return success(data, { status: 201 });
  }

  const { data, error: logError } = await supabase
    .from("habit_logs")
    .insert({
      user_id: user.id,
      habit_id: payload.habit_id,
      date: payload.date ?? new Date().toISOString().slice(0, 10),
      value: payload.value ?? null,
      target_value: payload.target_value ?? null,
      notes: payload.notes ?? null,
      mood_before: payload.mood_before ?? null,
      mood_after: payload.mood_after ?? null,
      difficulty_felt: payload.difficulty_felt ?? null,
    })
    .select("*")
    .single();

  if (logError) {
    console.error("Failed to log habit", logError);
    return error("Failed to log habit", { status: 500 });
  }

  return success<HabitLogRow>(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = updateHabitSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { id, ...updates } = parseResult.data;

  const { data, error: updateError } = await supabase
    .from("habits")
    .update(updates)
    .eq("user_id", user.id)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("Failed to update habit", updateError);
    return error("Failed to update habit", { status: 500 });
  }

  return success(data);
}

export async function DELETE(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = deleteHabitSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
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
    console.error("Failed to delete habit", deleteError);
    return error("Failed to delete habit", { status: 500 });
  }

  return success({ id });
}
