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

export type WidgetColumn = "left" | "right" | "bottom";

export interface WidgetLayout {
  left: WidgetKey[];
  right: WidgetKey[];
  bottom: WidgetKey[];
}

interface DashboardPreferencesState {
  widgetVisibility: WidgetVisibility;
  widgetLayout: WidgetLayout;
  actions: {
    toggleWidget: (widgetKey: WidgetKey) => void;
    setWidgetVisibility: (widgetKey: WidgetKey, visible: boolean) => void;
    setWidgetLayout: (layout: WidgetLayout) => void;
    moveWidget: (widgetKey: WidgetKey, fromColumn: WidgetColumn, toColumn: WidgetColumn, toIndex: number) => void;
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

const defaultLayout: WidgetLayout = {
  left: ["morningIntention", "practiceQuickActions", "todayOverview", "reflectionsStatus"],
  right: ["returnScoreTiles", "dailyQuote", "dailyInsight", "coachPreview"],
  bottom: ["personaSuggestedPractice", "practicesOverview"],
};

export const useDashboardPreferences = create<DashboardPreferencesState>()(
  persist(
    immer((set) => ({
      widgetVisibility: { ...defaultVisibility },
      widgetLayout: {
        left: [...defaultLayout.left],
        right: [...defaultLayout.right],
        bottom: [...defaultLayout.bottom],
      },
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
        setWidgetLayout: (layout) => {
          set((state) => {
            state.widgetLayout = layout;
          });
        },
        moveWidget: (widgetKey, fromColumn, toColumn, toIndex) => {
          set((state) => {
            // Remove from source column
            state.widgetLayout[fromColumn] = state.widgetLayout[fromColumn].filter(
              (key) => key !== widgetKey
            );

            // Add to target column at specified index
            state.widgetLayout[toColumn].splice(toIndex, 0, widgetKey);
          });
        },
        resetToDefaults: () => {
          set((state) => {
            state.widgetVisibility = { ...defaultVisibility };
            state.widgetLayout = {
              left: [...defaultLayout.left],
              right: [...defaultLayout.right],
              bottom: [...defaultLayout.bottom],
            };
          });
        },
      },
    })),
    {
      name: persistKey("dashboard-preferences"),
      version: persistVersion,
      storage: createPersistStorage<Pick<DashboardPreferencesState, "widgetVisibility" | "widgetLayout">>(),
      partialize: ({ widgetVisibility, widgetLayout }) => ({
        widgetVisibility,
        widgetLayout,
      }),
    },
  ),
);

export const selectWidgetVisibility = (state: DashboardPreferencesState) => state.widgetVisibility;
export const selectWidgetLayout = (state: DashboardPreferencesState) => state.widgetLayout;
export const selectDashboardActions = (state: DashboardPreferencesState) => state.actions;
