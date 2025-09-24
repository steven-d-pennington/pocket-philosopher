"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

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
