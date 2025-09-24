"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { selectHabitsActions, useHabitsStore, type Habit } from "@/lib/stores/habits-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

export interface HabitsResponse {
  habits: Habit[];
}

export function useHabits() {
  const actions = useHabitsStore(selectHabitsActions);

  const query = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const result = await apiFetch<ApiResponse<HabitsResponse>>("/api/habits");
      return result.data.habits;
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) {
      actions.initialize(query.data);
      actions.setLoading(false);
    }
    if (query.isFetching) {
      actions.setLoading(true);
    }
    if (query.error) {
      actions.setError(query.error instanceof Error ? query.error.message : String(query.error));
    }
  }, [actions, query.data, query.error, query.isFetching]);

  return query;
}
