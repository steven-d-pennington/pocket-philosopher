import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

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
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
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
    console.error("Failed to fetch reflections", dbError);
    return error("Failed to load reflections", { status: 500 });
  }

  return success({ reflections: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = createReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
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
    console.error("Failed to save reflection", insertError);
    return error("Failed to save reflection", { status: 500 });
  }

  return success(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = updateReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
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
    console.error("Failed to update reflection", updateError);
    return error("Failed to update reflection", { status: 500 });
  }

  return success(data);
}

export async function DELETE(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = deleteReflectionSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
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
    console.error("Failed to delete reflection", deleteError);
    return error("Failed to delete reflection", { status: 500 });
  }

  return success({ id });
}
