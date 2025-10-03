"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CoachCitation } from "@/lib/ai/types";
import type { CoachMessage } from "@/lib/stores/coach-store";
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

interface CoachConversationSummary {
  id: string;
  title: string;
  activePersona: string | null;
  updatedAt: string;
}

interface ConversationMessageRow {
  id?: string;
  role?: string;
  content?: string;
  created_at?: string;
  persona_id?: string | null;
  citations?: unknown;
}

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
  const conversationMode = useCoachStore((state) => state.conversationMode);
  const actions = useCoachStore((state) => state.actions);

  const [history, setHistory] = useState<CoachConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const lastHydratedConversationId = useRef<string | undefined>(conversation.conversationId);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch("/api/marcus", { method: "GET" });
      if (!response.ok) {
        throw new Error(`Failed to load conversations (${response.status})`);
      }

      const payload = await response.json();
      const summaries: CoachConversationSummary[] = Array.isArray(payload?.conversations)
        ? payload.conversations.map((item: Record<string, unknown>) => ({
            id: String(item.id ?? ""),
            title: typeof item.title === "string" && item.title.trim()
              ? item.title.trim()
              : "Untitled conversation",
            activePersona: typeof item.active_persona === "string" ? item.active_persona : null,
            updatedAt: typeof item.updated_at === "string" ? item.updated_at : new Date().toISOString(),
          }))
        : [];

      setHistory(summaries.filter((summary) => Boolean(summary.id)));
    } catch (error) {
      console.error("Failed to load coach conversation history", error);
      setHistoryError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return;
      setLoadingConversationId(conversationId);

      try {
        const response = await fetch(`/api/marcus?conversation_id=${conversationId}`);
        if (!response.ok) {
          throw new Error(`Failed to load conversation (${response.status})`);
        }

        const payload = await response.json();
        const conversationPersona =
          typeof payload?.conversation?.active_persona === "string"
            ? payload.conversation.active_persona
            : persona?.id;

        if (!conversationPersona) {
          throw new Error("Conversation does not include a persona id");
        }

        const toCoachMessage = (row: ConversationMessageRow): CoachMessage | null => {
          const id = typeof row.id === "string" && row.id ? row.id : crypto.randomUUID();
          const role = row.role === "assistant" ? "coach" : row.role === "system" ? "system" : "user";
          if (typeof row.content !== "string") {
            return null;
          }

          let citations: CoachCitation[] | undefined;
          if (Array.isArray(row.citations)) {
            citations = row.citations as CoachCitation[];
          }

          return {
            id,
            personaId: typeof row.persona_id === "string" && row.persona_id ? row.persona_id : conversationPersona,
            role,
            content: row.content,
            createdAt:
              typeof row.created_at === "string" && row.created_at
                ? row.created_at
                : new Date().toISOString(),
            citations,
          };
        };

        const mappedMessages = Array.isArray(payload?.messages)
          ? payload.messages
              .map((row: ConversationMessageRow) => toCoachMessage(row))
              .filter((message): message is CoachMessage => Boolean(message))
          : [];

        actions.hydrateConversation(conversationPersona, conversationId, mappedMessages);
        actions.selectPersona(conversationPersona);
        lastHydratedConversationId.current = conversationId;

        // Ensure updated list so ordering reflects latest selection
        void refreshHistory();
      } catch (error) {
        console.error("Failed to load conversation", error);
        setHistoryError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoadingConversationId(null);
      }
    },
    [actions, persona?.id, refreshHistory],
  );

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    const activeId = conversation.conversationId;
    if (activeId && lastHydratedConversationId.current !== activeId) {
      lastHydratedConversationId.current = activeId;
      void refreshHistory();
    }
  }, [conversation.conversationId, refreshHistory]);

  const historyForPersona = useMemo(() => {
    if (!persona) return history;
    return history.filter((item) => !item.activePersona || item.activePersona === persona.id);
  }, [history, persona]);

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
              mode: conversationMode,
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
                  void refreshHistory();

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
    [actions, persona, conversation.conversationId, conversationMode, refreshHistory],
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
    conversationHistory: historyForPersona,
    historyLoading,
    historyError,
    loadConversation,
    loadingConversationId,
    refreshHistory,
  };
}
