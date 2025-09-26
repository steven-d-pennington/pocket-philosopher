"use client";

import { useCallback } from "react";

import {
  selectActiveConversation,
  selectActivePersona,
  useCoachStore,
} from "@/lib/stores/coach-store";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

export function useCoachConversation() {
  const persona = useCoachStore(selectActivePersona);
  const conversation = useCoachStore(selectActiveConversation);
  const actions = useCoachStore((state) => state.actions);

  const sendMessage = useCallback(
    (input: string) => {
      const content = input.trim();

      if (!content || !persona) return;

      const userMessage = actions.sendUserMessage(persona.id, content);
      const streamingId = createId();
      actions.startStreaming(persona.id, streamingId);

      const fullReply = `Let's reflect on "${content}" together. Consider what is within your control, and respond with a mindful action.`;
      let index = 0;
      const chunkSize = 12;

      const interval = setInterval(() => {
        const nextIndex = Math.min(index + chunkSize, fullReply.length);
        const chunk = fullReply.slice(index, nextIndex);
        if (chunk.length > 0) {
          actions.appendStreamingChunk(persona.id, streamingId, chunk, nextIndex);
        }
        index = nextIndex;

        if (index >= fullReply.length) {
          clearInterval(interval);
          actions.completeStreaming(persona.id, streamingId);
        }
      }, 120);

      return userMessage.id;
    },
    [actions, persona],
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
