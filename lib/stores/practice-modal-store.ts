import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Practice } from "@/lib/stores/practices-store";

type PracticeModalMode = "closed" | "create" | "edit";

interface PracticeModalState {
  mode: PracticeModalMode;
  practice: Practice | null;
  actions: {
    openCreate: () => void;
    openEdit: (practice: Practice) => void;
    close: () => void;
  };
}

const initialState: Omit<PracticeModalState, "actions"> = {
  mode: "closed",
  practice: null,
};

export const usePracticeModalStore = create<PracticeModalState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      openCreate: () => {
        set((state) => {
          state.mode = "create";
          state.practice = null;
        });
      },
      openEdit: (practice) => {
        set((state) => {
          state.mode = "edit";
          state.practice = practice;
        });
      },
      close: () => {
        set(() => ({ ...initialState }));
      },
    },
  })),
);

export const selectPracticeModalActions = (state: PracticeModalState) => state.actions;

