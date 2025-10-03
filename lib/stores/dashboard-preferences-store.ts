import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createPersistStorage, persistKey, persistVersion } from "@/lib/stores/persist-utils";

export type WidgetKey =
  | "morningIntention"
  | "practiceQuickActions"
  | "todayOverview"
  | "reflectionsStatus"
  | "returnScoreTiles"
  | "dailyQuote"
  | "dailyInsight"
  | "coachPreview"
  | "personaSuggestedPractice"
  | "practicesOverview";

export interface WidgetVisibility {
  [key: string]: boolean;
}

interface DashboardPreferencesState {
  widgetVisibility: WidgetVisibility;
  actions: {
    toggleWidget: (widgetKey: WidgetKey) => void;
    setWidgetVisibility: (widgetKey: WidgetKey, visible: boolean) => void;
    resetToDefaults: () => void;
  };
}

const defaultVisibility: WidgetVisibility = {
  morningIntention: true,
  practiceQuickActions: true,
  todayOverview: true,
  reflectionsStatus: true,
  returnScoreTiles: true,
  dailyQuote: true,
  dailyInsight: true,
  coachPreview: true,
  personaSuggestedPractice: true,
  practicesOverview: true,
};

export const useDashboardPreferences = create<DashboardPreferencesState>()(
  persist(
    immer((set) => ({
      widgetVisibility: { ...defaultVisibility },
      actions: {
        toggleWidget: (widgetKey) => {
          set((state) => {
            state.widgetVisibility[widgetKey] = !state.widgetVisibility[widgetKey];
          });
        },
        setWidgetVisibility: (widgetKey, visible) => {
          set((state) => {
            state.widgetVisibility[widgetKey] = visible;
          });
        },
        resetToDefaults: () => {
          set((state) => {
            state.widgetVisibility = { ...defaultVisibility };
          });
        },
      },
    })),
    {
      name: persistKey("dashboard-preferences"),
      version: persistVersion,
      storage: createPersistStorage<Pick<DashboardPreferencesState, "widgetVisibility">>(),
      partialize: ({ widgetVisibility }) => ({
        widgetVisibility,
      }),
    },
  ),
);

export const selectWidgetVisibility = (state: DashboardPreferencesState) => state.widgetVisibility;
export const selectDashboardActions = (state: DashboardPreferencesState) => state.actions;
