import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type HabitStatus = "active" | "archived";
export type HabitFrequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  virtue: string;
  status: HabitStatus;
  frequency: HabitFrequency;
  reminderTime?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  sortOrder: number;
  tags?: string[];
}

export interface HabitsState {
  habits: Habit[];
  filter: {
    virtue?: string;
    status: HabitStatus;
  };
  loading: boolean;
  error: string | null;
  actions: {
    initialize: (habits: Habit[]) => void;
    setFilter: (filter: Partial<HabitsState["filter"]>) => void;
    upsertHabit: (habit: Habit) => void;
    archiveHabit: (id: string) => void;
    removeHabit: (id: string) => void;
    setLoading: (value: boolean) => void;
    setError: (message: string | null) => void;
    reset: () => void;
  };
}

const initialState: Omit<HabitsState, "actions"> = {
  habits: [],
  filter: {
    status: "active",
  },
  loading: false,
  error: null,
};

export const useHabitsStore = create<HabitsState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      initialize: (habits) => {
        set(() => ({
          ...initialState,
          habits: habits.sort((a, b) => a.sortOrder - b.sortOrder),
        }));
      },
      setFilter: (filter) => {
        set((state) => {
          state.filter = { ...state.filter, ...filter };
        });
      },
      upsertHabit: (habit) => {
        set((state) => {
          const index = state.habits.findIndex((item) => item.id === habit.id);
          if (index >= 0) {
            state.habits[index] = { ...state.habits[index], ...habit };
          } else {
            state.habits.push(habit);
          }
          state.habits.sort((a, b) => a.sortOrder - b.sortOrder);
        });
      },
      archiveHabit: (id) => {
        set((state) => {
          const habit = state.habits.find((item) => item.id === id);
          if (habit) {
            habit.status = "archived";
          }
        });
      },
      removeHabit: (id) => {
        set((state) => {
          state.habits = state.habits.filter((item) => item.id !== id);
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
);

export const selectHabits = (state: HabitsState) => state.habits;
export const selectHabitsFilter = (state: HabitsState) => state.filter;
export const selectHabitsActions = (state: HabitsState) => state.actions;
