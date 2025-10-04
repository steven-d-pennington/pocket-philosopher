import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface ProfileSummary {
  id: string;
  email?: string | null;
  displayName?: string | null;
  preferred_virtue?: string | null;
  preferred_persona?: string | null;
  experience_level?: string | null;
  daily_practice_time?: string | null;
  philosophyTheme?: string | null;
  notifications_enabled?: boolean;
  privacy_level?: string | null;
  timezone?: string | null;
  virtues?: string[];
  onboarding_complete?: boolean;
  blended_coach_chats?: boolean;
}

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  profile: ProfileSummary | null;
  hydrated: boolean;
  actions: {
    setStatus: (status: AuthStatus) => void;
    setSession: (session: Session | null) => void;
    setProfile: (profile: ProfileSummary | null) => void;
    hydrate: (payload: { session: Session | null; profile: ProfileSummary | null }) => void;
    reset: () => void;
  };
}

const initialState = {
  status: "idle" as AuthStatus,
  session: null,
  profile: null,
  hydrated: false,
};

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      setStatus: (status) => {
        set((state) => {
          state.status = status;
        });
      },
      setSession: (session) => {
        set((state) => {
          state.session = session;
          state.status = session ? "authenticated" : "unauthenticated";
        });
      },
      setProfile: (profile) => {
        set((state) => {
          state.profile = profile;
        });
      },
      hydrate: ({ session, profile }) => {
        set((state) => {
          state.session = session;
          state.profile = profile;
          state.status = session ? "authenticated" : "unauthenticated";
          state.hydrated = true;
        });
      },
      reset: () => {
        set(() => ({ ...initialState }));
      },
    },
  })),
);

export const selectAuthStatus = (state: AuthState) => state.status;
export const selectAuthSession = (state: AuthState) => state.session;
export const selectAuthProfile = (state: AuthState) => state.profile;
export const selectAuthActions = (state: AuthState) => state.actions;
export const selectAuthHydrated = (state: AuthState) => state.hydrated;
