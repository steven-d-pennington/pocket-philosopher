import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

const authSchema = z.object({
  action: z.enum(["signIn", "signUp"]),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const { supabase } = await createRouteContext();

  const json = await request.json().catch(() => null);
  const parseResult = authSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { action, email, password } = parseResult.data;

  if (action === "signUp") {
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      console.error("Supabase sign-up failed", signUpError);
      return error(signUpError.message, { status: 400 });
    }

    return success(data);
  }

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Supabase sign-in failed", signInError);
    return error(signInError.message, { status: 400 });
  }

  return success(data);
}

export async function DELETE() {
  const { supabase } = await createRouteContext();

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("Supabase sign-out failed", signOutError);
    return error(signOutError.message, { status: 500 });
  }

  return success({ success: true });
}
