import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createPersistStorage, persistKey, persistVersion } from "@/lib/stores/persist-utils";

export interface VirtueScores {
  [virtue: string]: number | null;
}

export interface DailyProgressState {
  date: string;
  intention: string | null;
  practicesCompleted: string[];
  virtueScores: VirtueScores;
  returnScore: number | null;
  streakDays: number;
  reflections: {
    morning: boolean;
    midday: boolean;
    evening: boolean;
  };
  loading: boolean;
  error: string | null;
  actions: {
    initialize: (payload: Partial<Omit<DailyProgressState, "actions">>) => void;
    setLoading: (value: boolean) => void;
    setError: (message: string | null) => void;
    setIntention: (intention: string) => void;
    togglePracticeCompletion: (practiceId: string) => void;
    setVirtueScore: (virtue: string, score: number | null) => void;
    setReflectionStatus: (type: keyof DailyProgressState["reflections"], value: boolean) => void;
    reset: () => void;
  };
}

type DailyProgressPersistedState = Pick<
  DailyProgressState,
  "date" | "intention" | "practicesCompleted" | "virtueScores" | "reflections"
>;

const initialState: Omit<DailyProgressState, "actions"> = {
  date: new Date().toISOString().slice(0, 10),
  intention: null,
  practicesCompleted: [],
  virtueScores: {},
  returnScore: null,
  streakDays: 0,
  reflections: {
    morning: false,
    midday: false,
    evening: false,
  },
  loading: false,
  error: null,
};

export const useDailyProgressStore = create<DailyProgressState>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      actions: {
        initialize: (payload) => {
          set(() => ({
            ...initialState,
            ...payload,
            reflections: {
              ...initialState.reflections,
              ...payload?.reflections,
            },
            virtueScores: {
              ...initialState.virtueScores,
              ...payload?.virtueScores,
            },
            practicesCompleted: payload?.practicesCompleted ?? initialState.practicesCompleted,
          }));
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
        setIntention: (intention) => {
          set((state) => {
            state.intention = intention;
          });
        },
        togglePracticeCompletion: (practiceId) => {
          set((state) => {
            const exists = state.practicesCompleted.includes(practiceId);
            state.practicesCompleted = exists
              ? state.practicesCompleted.filter((id) => id !== practiceId)
              : [...state.practicesCompleted, practiceId];
          });
        },
        setVirtueScore: (virtue, score) => {
          set((state) => {
            state.virtueScores[virtue] = score;
          });
        },
        setReflectionStatus: (type, value) => {
          set((state) => {
            state.reflections[type] = value;
          });
        },
        reset: () => {
          const currentDate = get().date ?? new Date().toISOString().slice(0, 10);
          set(() => ({ ...initialState, date: currentDate }));
        },
      },
    })),
    {
      name: persistKey("daily-progress"),
      version: persistVersion,
      storage: createPersistStorage<DailyProgressPersistedState>(),
      partialize: ({
        date,
        intention,
        practicesCompleted,
        virtueScores,
        reflections,
      }): DailyProgressPersistedState => ({
        date,
        intention,
        practicesCompleted,
        virtueScores,
        reflections,
      }),
    },
  ),
);

export const selectDailyProgress = (state: DailyProgressState) => state;
export const selectDailyProgressActions = (state: DailyProgressState) => state.actions;
