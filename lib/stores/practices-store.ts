import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createPersistStorage, persistKey, persistVersion } from "@/lib/stores/persist-utils";

export type PracticeStatus = "active" | "archived";
export type PracticeFrequency = "daily" | "weekly" | "custom";

export interface Practice {
  id: string;
  name: string;
  description?: string | null;
  virtue: string;
  status: PracticeStatus;
  frequency: PracticeFrequency;
  reminderTime?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  sortOrder: number;
  tags?: string[];
  trackingType?: string;
  targetValue?: number | null;
  activeDays?: number[] | null;
}

export interface PracticesState {
  practices: Practice[];
  filter: {
    virtue?: string;
    status: PracticeStatus;
  };
  loading: boolean;
  error: string | null;
  actions: {
    initialize: (practices: Practice[]) => void;
    setFilter: (filter: Partial<PracticesState["filter"]>) => void;
    upsertPractice: (practice: Practice) => void;
    archivePractice: (id: string) => void;
    removePractice: (id: string) => void;
    setLoading: (value: boolean) => void;
    setError: (message: string | null) => void;
    reset: () => void;
  };
}

type PracticesPersistedState = Pick<PracticesState, "practices" | "filter">;

const initialState: Omit<PracticesState, "actions"> = {
  practices: [],
  filter: {
    status: "active",
  },
  loading: false,
  error: null,
};

export const usePracticesStore = create<PracticesState>()(
  persist(
    immer((set) => ({
      ...initialState,
      actions: {
        initialize: (practices) => {
          set(() => ({
            ...initialState,
            practices: practices.sort((a, b) => a.sortOrder - b.sortOrder),
          }));
        },
        setFilter: (filter) => {
          set((state) => {
            state.filter = { ...state.filter, ...filter };
          });
        },
        upsertPractice: (practice) => {
          set((state) => {
            const index = state.practices.findIndex((item) => item.id === practice.id);
            if (index >= 0) {
              state.practices[index] = { ...state.practices[index], ...practice };
            } else {
              state.practices.push(practice);
            }
            state.practices.sort((a, b) => a.sortOrder - b.sortOrder);
          });
        },
        archivePractice: (id) => {
          set((state) => {
            const practice = state.practices.find((item) => item.id === id);
            if (practice) {
              practice.status = "archived";
            }
          });
        },
        removePractice: (id) => {
          set((state) => {
            state.practices = state.practices.filter((item) => item.id !== id);
          });
        },
        setLoading: (value) => {
          set((state) => {
            state.loading = value;
            if (value) state.error = null;
          });
        },
        setError: (message) => {
          set((state) => {
            state.error = message;
          });
        },
        reset: () => {
          set(() => ({ ...initialState }));
        },
      },
    })),
    {
      name: persistKey("practices"),
      version: persistVersion,
      storage: createPersistStorage<PracticesPersistedState>(),
      partialize: ({ practices, filter }): PracticesPersistedState => ({ practices, filter }),
    },
  ),
);

export const selectPractices = (state: PracticesState) => state.practices;
export const selectPracticesFilter = (state: PracticesState) => state.filter;
export const selectPracticesActions = (state: PracticesState) => state.actions;
