import { z } from "zod";

import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";
import type { Database } from "@/lib/supabase/types";
import { sanitizeUserText } from "@/lib/security/sanitize";

const ROUTE = "/api/profile";

const profileUpdateSchema = z.object({
  preferred_virtue: z.string().min(1).optional(),
  preferred_persona: z.string().min(1).optional(),
  experience_level: z.string().optional(),
  daily_practice_time: z.string().optional(),
  timezone: z.string().optional(),
  notifications_enabled: z.boolean().optional(),
  blended_coach_chats: z.boolean().optional(),
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

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to profile", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  try {
    const profile = await ensureProfile(supabase, user.id);
    logger.info("Profile retrieved");
    return respondWithSuccess(logger, profile);
  } catch (err) {
    logger.error("Failed to fetch profile", err);
    return respondWithError(logger, "Failed to fetch profile", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to profile", { method: "PUT" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = profileUpdateSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid profile payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const payload: ProfileUpdatePayload = parseResult.data;

  const sanitizedPayload: ProfileUpdatePayload = { ...payload };

  if (payload.preferred_virtue !== undefined) {
    const sanitizedVirtue = sanitizeUserText(payload.preferred_virtue, { maxLength: 120 });
    if (!sanitizedVirtue) {
      logger.warn("Profile virtue sanitized to empty");
      return respondWithError(logger, "Invalid preferred virtue", { status: 400 });
    }
    sanitizedPayload.preferred_virtue = sanitizedVirtue;
  }

  if (payload.preferred_persona !== undefined) {
    const sanitizedPersona = sanitizeUserText(payload.preferred_persona, { maxLength: 120 });
    if (!sanitizedPersona) {
      logger.warn("Profile persona sanitized to empty");
      return respondWithError(logger, "Invalid preferred persona", { status: 400 });
    }
    sanitizedPayload.preferred_persona = sanitizedPersona;
  }

  if (payload.experience_level !== undefined) {
    sanitizedPayload.experience_level = sanitizeUserText(payload.experience_level, { maxLength: 120 }) || undefined;
  }

  if (payload.daily_practice_time !== undefined) {
    sanitizedPayload.daily_practice_time = sanitizeUserText(payload.daily_practice_time, { maxLength: 32 }) || undefined;
  }

  if (payload.timezone !== undefined) {
    sanitizedPayload.timezone = sanitizeUserText(payload.timezone, { maxLength: 120 }) || undefined;
  }

  if (payload.privacy_level !== undefined) {
    sanitizedPayload.privacy_level = sanitizeUserText(payload.privacy_level, { maxLength: 120 }) || undefined;
  }

  try {
    await ensureProfile(supabase, user.id);

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(sanitizedPayload)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError) {
      logger.error("Failed to update profile", updateError);
      return respondWithError(logger, "Failed to update profile", { status: 500 });
    }

    logger.info("Profile updated", { fields: Object.keys(payload) });
    return respondWithSuccess(logger, data);
  } catch (err) {
    logger.error("Profile update failed", err);
    return respondWithError(logger, "Failed to update profile", { status: 500 });
  }
}
