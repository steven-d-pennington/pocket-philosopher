import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createPersistStorage, persistKey, persistVersion } from "@/lib/stores/persist-utils";

type ThemeMode = "system" | "light" | "dark";

type ModalKey = "none" | "createPractice" | "editPractice" | "reflection" | "coachPersona" | "settings";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "error";
}

interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  activeModal: ModalKey;
  toasts: ToastMessage[];
  commandPaletteOpen: boolean;
  actions: {
    setTheme: (theme: ThemeMode) => void;
    toggleSidebar: () => void;
    setSidebar: (value: boolean) => void;
    openModal: (modal: Exclude<ModalKey, "none">) => void;
    closeModal: () => void;
    pushToast: (toast: ToastMessage) => void;
    removeToast: (id: string) => void;
    setCommandPalette: (value: boolean) => void;
    reset: () => void;
  };
}

const initialState: Omit<UIState, "actions"> = {
  theme: "system",
  sidebarCollapsed: false,
  activeModal: "none",
  toasts: [],
  commandPaletteOpen: false,
};

type UIPersistedState = Pick<UIState, "theme" | "sidebarCollapsed">;

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      ...initialState,
      actions: {
        setTheme: (theme) => {
          set((state) => {
            state.theme = theme;
          });
        },
        toggleSidebar: () => {
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          });
        },
        setSidebar: (value) => {
          set((state) => {
            state.sidebarCollapsed = value;
          });
        },
        openModal: (modal) => {
          set((state) => {
            state.activeModal = modal;
          });
        },
        closeModal: () => {
          set((state) => {
            state.activeModal = "none";
          });
        },
        pushToast: (toast) => {
          set((state) => {
            state.toasts.push(toast);
          });
        },
        removeToast: (id) => {
          set((state) => {
            state.toasts = state.toasts.filter((toast) => toast.id !== id);
          });
        },
        setCommandPalette: (value) => {
          set((state) => {
            state.commandPaletteOpen = value;
          });
        },
        reset: () => {
          set(() => ({ ...initialState }));
        },
      },
    })),
    {
      name: persistKey("ui"),
      version: persistVersion,
      storage: createPersistStorage<UIPersistedState>(),
      partialize: ({ theme, sidebarCollapsed }): UIPersistedState => ({
        theme,
        sidebarCollapsed,
      }),
    },
  ),
);

export const selectTheme = (state: UIState) => state.theme;
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectUIActions = (state: UIState) => state.actions;

