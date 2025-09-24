import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface VirtueScores {
  [virtue: string]: number | null;
}

export interface DailyProgressState {
  date: string;
  intention: string | null;
  habitsCompleted: string[];
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
    toggleHabitCompletion: (habitId: string) => void;
    setVirtueScore: (virtue: string, score: number | null) => void;
    setReflectionStatus: (type: keyof DailyProgressState["reflections"], value: boolean) => void;
    reset: () => void;
  };
}

const initialState: Omit<DailyProgressState, "actions"> = {
  date: new Date().toISOString().slice(0, 10),
  intention: null,
  habitsCompleted: [],
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
  immer((set) => ({
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
      toggleHabitCompletion: (habitId) => {
        set((state) => {
          const exists = state.habitsCompleted.includes(habitId);
          state.habitsCompleted = exists
            ? state.habitsCompleted.filter((id) => id !== habitId)
            : [...state.habitsCompleted, habitId];
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
        set(() => ({ ...initialState, date: new Date().toISOString().slice(0, 10) }));
      },
    },
  })),
);

export const selectDailyProgress = (state: DailyProgressState) => state;
export const selectDailyProgressActions = (state: DailyProgressState) => state.actions;
