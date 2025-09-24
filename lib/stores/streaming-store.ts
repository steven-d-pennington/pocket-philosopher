import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type StreamingStatus = "idle" | "streaming" | "error" | "complete";

export interface StreamingChunk {
  id: string;
  content: string;
  createdAt: number;
}

export interface Citation {
  id: string;
  title: string;
  reference: string;
  url?: string;
}

interface StreamingState {
  status: StreamingStatus;
  message: string;
  tokens: number;
  chunks: StreamingChunk[];
  citations: Citation[];
  warning: string | null;
  actions: {
    start: () => void;
    appendChunk: (chunk: StreamingChunk) => void;
    complete: (payload?: { citations?: Citation[] }) => void;
    fail: (message: string) => void;
    reset: () => void;
  };
}

const initialState: Omit<StreamingState, "actions"> = {
  status: "idle",
  message: "",
  tokens: 0,
  chunks: [],
  citations: [],
  warning: null,
};

export const useStreamingStore = create<StreamingState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      start: () => {
        set(() => ({
          ...initialState,
          status: "streaming",
        }));
      },
      appendChunk: (chunk) => {
        set((state) => {
          state.chunks.push(chunk);
          state.tokens += chunk.content.length;
          state.message += chunk.content;
        });
      },
      complete: (payload) => {
        set((state) => {
          state.status = "complete";
          state.citations = payload?.citations ?? state.citations;
        });
      },
      fail: (message) => {
        set((state) => {
          state.status = "error";
          state.warning = message;
        });
      },
      reset: () => {
        set(() => ({ ...initialState }));
      },
    },
  })),
);

export const selectStreamingState = (state: StreamingState) => state;
export const selectStreamingActions = (state: StreamingState) => state.actions;
