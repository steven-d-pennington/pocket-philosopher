import { useEffect, useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { selectDailyProgressActions, useDailyProgressStore } from "@/lib/stores/daily-progress-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

export interface DailyProgressPayload {
  date: string;
  intention: string | null;
  practicesCompleted: string[];
  virtueScores: Record<string, number | null>;
  returnScore: number | null;
  streakDays: number;
  reflections: {
    morning: boolean;
    midday: boolean;
    evening: boolean;
  };
}

export function useDailyProgress(date?: string) {
  const targetDate = useMemo(
    () => date ?? new Date().toISOString().slice(0, 10),
    [date],
  );
  const actions = useDailyProgressStore(selectDailyProgressActions);

  const query = useQuery({
    queryKey: ["daily-progress", targetDate],
    queryFn: async () => {
      const result = await apiFetch<ApiResponse<DailyProgressPayload>>(
        `/api/daily-progress?date=${encodeURIComponent(targetDate)}`,
      );
      return result.data;
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data) {
      actions.initialize({ ...query.data, date: targetDate });
      actions.setLoading(false);
    }
    if (query.isFetching) {
      actions.setLoading(true);
    }
    if (query.error) {
      actions.setError(query.error instanceof Error ? query.error.message : String(query.error));
    }
  }, [actions, query.data, query.error, query.isFetching, targetDate]);

  return query;
}

export function useSetIntentionMutation(targetDate?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intention: string) => {
      const payload = await apiFetch<ApiResponse<{ date: string; intention: string }>>(
        "/api/daily-progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set_intention",
            date: targetDate,
            intention,
          }),
        },
      );

      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-progress"] });
    },
  });
}

export function usePracticeCompletionMutation(targetDate?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      practiceId,
      completed,
    }: {
      practiceId: string;
      completed: boolean;
    }) => {
      const payload = await apiFetch<ApiResponse<{ practice_id: string; completed: boolean; date: string }>>(
        "/api/daily-progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_practice",
            practice_id: practiceId,
            completed,
            date: targetDate,
          }),
        },
      );

      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-progress"] });
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
  });
}

