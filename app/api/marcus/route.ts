import { z } from "zod";

import { error, success } from "@/app/api/_lib/response";
import { createRouteContext } from "@/app/api/_lib/supabase-route";
import { createCoachStream } from "@/lib/ai/orchestrator";
import type { ConversationTurn } from "@/lib/ai/types";
import type { Json } from "@/lib/supabase/types";

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

  const { data: historyRows, error: historyError } = await supabase
    .from("marcus_messages")
    .select("role, content")
    .eq("conversation_id", activeConversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (historyError) {
    console.error("Failed to load conversation history", historyError);
  }

  const history: ConversationTurn[] = (historyRows ?? []).map((row) => {
    const role = row.role === "assistant" || row.role === "system" ? row.role : "user";
    return { role, content: row.content };
  });

  const assistantMessageId = crypto.randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("start", {
          conversation_id: activeConversationId,
          message_id: assistantMessageId,
          persona_id: persona,
        });

        const coachStream = await createCoachStream({
          supabase,
          userId: user.id,
          personaId: persona,
          message,
          history,
        });

        for await (const chunk of coachStream.stream) {
          send("chunk", { delta: chunk.delta, tokens: chunk.tokens });
        }

        const result = await coachStream.finalize();

        const { error: assistantInsertError } = await supabase.from("marcus_messages").insert({
          id: assistantMessageId,
          user_id: user.id,
          conversation_id: activeConversationId,
          role: "assistant",
          content: result.content,
          persona_id: persona,
          citations: result.citations as unknown as Json,
        });

        if (assistantInsertError) {
          console.error("Failed to persist assistant message", assistantInsertError);
          send("error", { message: "Unable to store coach response." });
          return;
        }

        const { error: updateError } = await supabase
          .from("marcus_conversations")
          .update({
            active_persona: persona,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeConversationId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to update conversation metadata", updateError);
        }

        send("complete", {
          conversation_id: activeConversationId,
          message_id: assistantMessageId,
          citations: result.citations,
          tokens: result.tokens,
        });
      } catch (streamError) {
        console.error("Coach streaming failed", streamError);
        send("error", {
          message: "Your coach is unavailable right now. Please try again shortly.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
