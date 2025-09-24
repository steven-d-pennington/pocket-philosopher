import { error, success } from "@/app/api/_lib/response";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch (err) {
    return error("Service role client unavailable", { status: 500, details: err });
  }

  const payload = await request.json().catch(() => ({}));

  const { error: connectivityError } = await supabase
    .from("philosophy_chunks")
    .select("id")
    .limit(1);

  if (connectivityError) {
    return error("Corpus store unavailable", { status: 503, details: connectivityError });
  }

  console.info("Received AI ingest request", payload);

  return success({ status: "queued" }, { status: 202 });
}
