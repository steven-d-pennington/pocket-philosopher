import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";

const chatSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1),
  persona: z.string().default("marcus"),
});

export async function GET() {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const { data, error: dbError } = await supabase
    .from("marcus_conversations")
    .select("id, title, active_persona, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (dbError) {
    console.error("Failed to load conversations", dbError);
    return error("Failed to load conversations", { status: 500 });
  }

  return success({ conversations: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await createRouteContext();

  if (!user) {
    return error("Unauthorized", { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parseResult = chatSchema.safeParse(json);

  if (!parseResult.success) {
    return error("Invalid payload", {
      status: 400,
      details: parseResult.error.flatten(),
    });
  }

  const { conversation_id, message, persona } = parseResult.data;

  let activeConversationId = conversation_id ?? null;

  if (!activeConversationId) {
    const { data: newConversation, error: insertError } = await supabase
      .from("marcus_conversations")
      .insert({
        user_id: user.id,
        title: message.slice(0, 80),
        active_persona: persona,
        context_type: "chat",
      })
      .select("id")
      .single();

    if (insertError || !newConversation) {
      console.error("Failed to create conversation", insertError);
      return error("Failed to create conversation", { status: 500 });
    }

    activeConversationId = newConversation.id;
  }

  const { error: messageError } = await supabase.from("marcus_messages").insert({
    user_id: user.id,
    conversation_id: activeConversationId,
    role: "user",
    content: message,
    persona_id: persona,
  });

  if (messageError) {
    console.error("Failed to persist user message", messageError);
    return error("Failed to store message", { status: 500 });
  }

  // Placeholder assistant response until AI orchestration is wired in.
  const assistantMessage = {
    content:
      "Your coach is being rebuilt. AI responses will stream from this endpoint once the orchestration layer is connected.",
    persona,
  };

  return success(
    { conversation_id: activeConversationId, assistant: assistantMessage },
    { status: 202 },
  );
}
