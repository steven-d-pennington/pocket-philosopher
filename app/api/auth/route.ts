import { z } from "zod";

import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/auth";

const authSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("signIn"),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  z.object({
    action: z.literal("signUp"),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  z.object({
    action: z.literal("anonymous"),
  }),
]);

export async function POST(request: Request) {
  const logger = createApiRequestLogger(request, ROUTE);
  const { supabase } = await createRouteContext();

  const json = await request.json().catch(() => null);
  const parseResult = authSchema.safeParse(json);

  if (!parseResult.success) {
    logger.warn("Invalid auth payload", { issues: parseResult.error.flatten() });
    return respondWithError(logger, "Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const data = parseResult.data;

  if (data.action === "anonymous") {
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();

    if (anonError) {
      logger.error("Supabase anonymous sign-in failed", anonError, {});
      return respondWithError(logger, anonError.message, { status: 400 });
    }

    logger.info("Anonymous user signed in", {});
    return respondWithSuccess(logger, anonData);
  }

  if (data.action === "signUp") {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      logger.error("Supabase sign-up failed", signUpError, {});
      return respondWithError(logger, signUpError.message, { status: 400 });
    }

    logger.info("User signed up", {});
    return respondWithSuccess(logger, signUpData);
  }

  // signIn case
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInError) {
    logger.error("Supabase sign-in failed", signInError, {});
    return respondWithError(logger, signInError.message, { status: 400 });
  }

  logger.info("User signed in", {});
  return respondWithSuccess(logger, signInData);
}

export async function DELETE(request: Request) {
  const logger = createApiRequestLogger(request, ROUTE);
  const { supabase } = await createRouteContext();

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    logger.error("Supabase sign-out failed", signOutError);
    return respondWithError(logger, signOutError.message, { status: 500 });
  }

  logger.info("User signed out");
  return respondWithSuccess(logger, { success: true });
}

