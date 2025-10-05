"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { selectAuthActions, useAuthStore, type ProfileSummary } from "@/lib/stores/auth-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

export function useProfile() {
  const actions = useAuthStore(selectAuthActions);

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const result = await apiFetch<ApiResponse<ProfileSummary>>("/api/profile");
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      actions.setProfile(query.data);
    }
  }, [actions, query.data]);

  return query;
}

export type ProfileUpdateInput = Partial<{
  preferred_virtue: string;
  preferred_persona: string;
  experience_level: string;
  daily_practice_time: string;
  timezone: string;
  notifications_enabled: boolean;
  privacy_level: string;
  onboarding_complete: boolean;
  default_model_id: string;
  persona_model_overrides: Record<string, string>;
}>;

export function useUpdateProfileMutation() {
  const actions = useAuthStore(selectAuthActions);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfileUpdateInput) => {
      const result = await apiFetch<ApiResponse<ProfileSummary>>("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return result.data;
    },
    onSuccess: (profile) => {
      actions.setProfile(profile);
      queryClient.setQueryData(["profile"], profile);
    },
  });
}
