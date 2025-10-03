import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Practice } from "@/lib/stores/practices-store";

type PracticeModalMode = "closed" | "create" | "edit";

type PracticeDraft = Partial<
  Pick<
    Practice,
    |
      "name"
      | "description"
      | "virtue"
      | "frequency"
      | "difficulty"
      | "reminderTime"
      | "tags"
      | "activeDays"
  >
>;

interface PracticeModalState {
  mode: PracticeModalMode;
  practice: Practice | null;
  draft: PracticeDraft | null;
  actions: {
    openCreate: (defaults?: PracticeDraft) => void;
    openEdit: (practice: Practice) => void;
    close: () => void;
  };
}

const initialState: Omit<PracticeModalState, "actions"> = {
  mode: "closed",
  practice: null,
  draft: null,
};

export const usePracticeModalStore = create<PracticeModalState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      openCreate: (defaults) => {
        set((state) => {
          state.mode = "create";
          state.practice = null;
          state.draft = defaults ?? null;
        });
      },
      openEdit: (practice) => {
        set((state) => {
          state.mode = "edit";
          state.practice = practice;
          state.draft = null;
        });
      },
      close: () => {
        set(() => ({ ...initialState }));
      },
    },
  })),
);

export const selectPracticeModalActions = (state: PracticeModalState) => state.actions;
export const selectPracticeModalDraft = (state: PracticeModalState) => state.draft;
