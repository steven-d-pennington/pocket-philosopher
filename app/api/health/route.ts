import { error, success } from "@/app/api/_lib/response";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export async function GET() {
  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch (err) {
    return error("Service role client unavailable", { status: 500, details: err });
  }

  const { error: dbError } = await supabase.from("profiles").select("user_id").limit(1);

  const status = {
    supabase: dbError ? "error" : "ok",
    timestamp: new Date().toISOString(),
    details: dbError ? dbError.message : null,
  } as const;

  if (dbError) {
    console.error("Health check database probe failed", dbError);
    return error("Health check failed", { status: 503, details: status });
  }

  return success(status);
}
