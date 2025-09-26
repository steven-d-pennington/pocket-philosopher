import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";
import type { Database } from "@/lib/supabase/types";

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
  tags: z.array(z.string()).optional(),
});

const createPracticeSchema = basePracticeSchema;

const completePracticeSchema = z.object({
  action: z.literal("complete_practice"),
  practice_id: z.string().uuid(),
  date: z.string().optional(),
  value: z.number().nullable().optional(),
  target_value: z.number().nullable().optional(),
  notes: z.string().optional(),
  mood_before: z.string().optional(),
  mood_after: z.string().optional(),
  difficulty_felt: z.string().optional(),
});

const createPracticeActionSchema = z.object({
  action: z.literal("create"),
  practice: createPracticeSchema,
});

const practicePostSchema = z.discriminatedUnion("action", [
  createPracticeActionSchema,
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
    console.error("Failed to fetch practices", dbError);
    return error("Failed to load practices", { status: 500 });
  }

  return success<{ practices: PracticeRow[] }>({ practices: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = practicePostSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;

  if (payload.action === "create") {
    const practiceInput = payload.practice;
    const { data, error: insertError } = await supabase
      .from("habits")
      .insert({
        ...practiceInput,
        user_id: user.id,
        active_days: practiceInput.active_days ?? [1, 2, 3, 4, 5, 6, 7],
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to create practice", insertError);
      return error("Failed to create practice", { status: 500 });
    }

    return success(data, { status: 201 });
  }

  const { data, error: logError } = await supabase
    .from("habit_logs")
    .upsert(
      {
        user_id: user.id,
        habit_id: payload.practice_id,
        date: payload.date ?? new Date().toISOString().slice(0, 10),
        value: payload.value ?? null,
        target_value: payload.target_value ?? null,
        notes: payload.notes ?? null,
        mood_before: payload.mood_before ?? null,
        mood_after: payload.mood_after ?? null,
        difficulty_felt: payload.difficulty_felt ?? null,
      },
      { onConflict: "user_id,habit_id,date" },
    )
    .select("habit_id, date")
    .single();

  if (logError) {
    console.error("Failed to log practice", logError);
    return error("Failed to log practice", { status: 500 });
  }

  return success({
    practice_id: data.habit_id,
    completed: true,
    date: data.date,
  });
}

export async function PUT(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = updatePracticeSchema.safeParse(json);

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
    console.error("Failed to update practice", updateError);
    return error("Failed to update practice", { status: 500 });
  }

  return success(data);
}

export async function DELETE(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = deletePracticeSchema.safeParse(json);

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
    console.error("Failed to delete practice", deleteError);
    return error("Failed to delete practice", { status: 500 });
  }

  return success({ id });
}
