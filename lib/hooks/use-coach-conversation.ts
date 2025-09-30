"use client";

import { useCallback } from "react";

import type { CoachCitation } from "@/lib/ai/types";
import {
  selectActiveConversation,
  selectActivePersona,
  useCoachStore,
} from "@/lib/stores/coach-store";

interface ParsedEvent<T = unknown> {
  event: string;
  data: T;
}

const decoder = new TextDecoder();

function parseSSEEvents(buffer: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const segments = buffer.split("\n\n");

  for (const segment of segments) {
    if (!segment.trim()) continue;
    const lines = segment.split("\n");
    let event = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data += line.slice(5).trim();
      }
    }

    if (data) {
      try {
        events.push({ event, data: JSON.parse(data) });
      } catch (error) {
        console.error("Failed to parse SSE event", error);
      }
    }
  }

  return events;
}

export function useCoachConversation() {
  const persona = useCoachStore(selectActivePersona);
  const conversation = useCoachStore(selectActiveConversation);
  const actions = useCoachStore((state) => state.actions);

  const sendMessage = useCallback(
    (input: string) => {
      const content = input.trim();
      const startTime = Date.now();

      if (!content || !persona) return;

      const personaId = persona.id;
      const existingConversationId = conversation.conversationId;
      const userMessage = actions.sendUserMessage(personaId, content);

      void (async () => {
        let assistantMessageId: string | null = null;
        try {
          const response = await fetch("/api/marcus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation_id: existingConversationId,
              message: content,
              persona: personaId,
            }),
          });

          if (!response.ok || !response.body) {
            throw new Error("Coach response unavailable");
          }

          const reader = response.body.getReader();
          let buffer = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lastSeparator = buffer.lastIndexOf("\n\n");
            if (lastSeparator === -1) {
              continue;
            }

            const processed = buffer.slice(0, lastSeparator + 2);
            buffer = buffer.slice(lastSeparator + 2);

            const events = parseSSEEvents(processed);

            for (const event of events) {
              switch (event.event) {
                case "start": {
                  const data = event.data as {
                    message_id?: string;
                    conversation_id?: string;
                  };
                  if (data.conversation_id) {
                    actions.setConversationId(personaId, data.conversation_id);
                  }
                  if (data.message_id) {
                    assistantMessageId = data.message_id;
                    actions.startStreaming(personaId, data.message_id);
                  }
                  break;
                }
                case "chunk": {
                  if (!assistantMessageId) break;
                  const data = event.data as { delta?: string; tokens?: number };
                  actions.appendStreamingChunk(
                    personaId,
                    assistantMessageId,
                    data.delta ?? "",
                    data.tokens ?? 0,
                  );
                  break;
                }
                case "complete": {
                  if (!assistantMessageId) break;
                  const data = event.data as {
                    citations?: unknown[];
                    tokens?: number;
                  };
                  const duration = Date.now() - startTime;
                  actions.completeStreaming(personaId, assistantMessageId, {
                    citations: Array.isArray(data.citations)
                      ? (data.citations as CoachCitation[])
                      : undefined,
                    tokens: typeof data.tokens === "number" ? data.tokens : undefined,
                  });

                  // Performance monitoring
                  const posthog = (window as Window & { posthog?: { capture: (event: string, data: Record<string, unknown>) => void } }).posthog;
                  if (typeof window !== "undefined" && posthog) {
                    posthog.capture("coach_response_complete", {
                      personaId,
                      duration,
                      tokens: data.tokens,
                      hasCitations: Array.isArray(data.citations) && data.citations.length > 0,
                      timestamp: Date.now(),
                    });
                  }

                  assistantMessageId = null;
                  break;
                }
                case "error": {
                  const data = event.data as { message?: string };
                  if (assistantMessageId) {
                    actions.failStreaming(
                      personaId,
                      assistantMessageId,
                      data.message ?? "Your coach encountered an unexpected error.",
                    );
                    assistantMessageId = null;
                  } else {
                    actions.setTyping(personaId, false);
                  }
                  break;
                }
                default:
                  break;
              }
            }
          }

          if (buffer.trim()) {
            const events = parseSSEEvents(buffer);
            for (const event of events) {
              if (event.event === "complete" && assistantMessageId) {
                const data = event.data as {
                  citations?: unknown[];
                  tokens?: number;
                };
                actions.completeStreaming(personaId, assistantMessageId, {
                  citations: Array.isArray(data.citations)
                    ? (data.citations as CoachCitation[])
                    : undefined,
                  tokens: typeof data.tokens === "number" ? data.tokens : undefined,
                });
                assistantMessageId = null;
              }
            }
          }

          if (assistantMessageId) {
            actions.completeStreaming(personaId, assistantMessageId);
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error("Coach conversation failed", error);

          // Performance monitoring for errors
          const posthog = (window as Window & { posthog?: { capture: (event: string, data: Record<string, unknown>) => void } }).posthog;
          if (typeof window !== "undefined" && posthog) {
            posthog.capture("coach_response_error", {
              personaId,
              duration,
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: Date.now(),
            });
          }

          if (assistantMessageId) {
            actions.failStreaming(
              personaId,
              assistantMessageId,
              "Your coach is temporarily unavailable. Please try again shortly.",
            );
          } else {
            actions.setTyping(personaId, false);
          }
        }
      })();

      return userMessage.id;
    },
    [actions, persona, conversation.conversationId],
  );

  const resetConversation = useCallback(() => {
    if (!persona) return;
    actions.resetConversation(persona.id);
  }, [actions, persona]);

  return {
    persona,
    conversation,
    sendMessage,
    resetConversation,
  };
}
