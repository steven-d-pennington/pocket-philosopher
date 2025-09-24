import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";
import type { Database } from "@/lib/supabase/types";

const profileUpdateSchema = z.object({
  preferred_virtue: z.string().min(1).optional(),
  preferred_persona: z.string().min(1).optional(),
  experience_level: z.string().optional(),
  daily_practice_time: z.string().optional(),
  timezone: z.string().optional(),
  notifications_enabled: z.boolean().optional(),
  privacy_level: z.string().optional(),
  onboarding_complete: z.boolean().optional(),
});

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>;

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createRouteContext>>["supabase"],
  userId: string,
) {
  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  if (data) {
    return data as ProfileRow;
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return created as ProfileRow;
}

export async function GET() {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  try {
    const profile = await ensureProfile(supabase, user.id);
    return success(profile);
  } catch (err) {
    console.error("Failed to fetch profile", err);
    return error("Failed to fetch profile", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);

  const parseResult = profileUpdateSchema.safeParse(json);
  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload: ProfileUpdatePayload = parseResult.data;

  try {
    await ensureProfile(supabase, user.id);

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Failed to update profile", updateError);
      return error("Failed to update profile", { status: 500 });
    }

    return success(data);
  } catch (err) {
    console.error("Profile update failed", err);
    return error("Failed to update profile", { status: 500 });
  }
}
