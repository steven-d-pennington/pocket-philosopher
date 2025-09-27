"use client";

import { useEffect, useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/supabase/types";
import {
  selectDailyProgressActions,
  useDailyProgressStore,
} from "@/lib/stores/daily-progress-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

export type ReflectionType = "morning" | "midday" | "evening";

type ReflectionRow = Database["public"]["Tables"]["reflections"]["Row"];

export interface Reflection {
  id: string;
  date: string;
  type: ReflectionType;
  virtueFocus: string | null;
  intention: string | null;
  lesson: string | null;
  gratitude: string | null;
  challenge: string | null;
  mood: number | null;
  journalEntry: string | null;
  keyInsights: string[] | null;
  challengesFaced: string[] | null;
  winsCelebrated: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface ReflectionsResponse {
  reflections: ReflectionRow[];
}

interface SaveReflectionInput {
  date: string;
  type: ReflectionType;
  virtueFocus?: string | null;
  intention?: string | null;
  lesson?: string | null;
  gratitude?: string | null;
  challenge?: string | null;
  mood?: number | null;
  journalEntry?: string | null;
  keyInsights?: string[] | null;
  challengesFaced?: string[] | null;
  winsCelebrated?: string[] | null;
}

const transformReflection = (row: ReflectionRow): Reflection => ({
  id: row.id,
  date: row.date,
  type: row.type as ReflectionType,
  virtueFocus: row.virtue_focus,
  intention: row.intention,
  lesson: row.lesson,
  gratitude: row.gratitude,
  challenge: row.challenge,
  mood: row.mood,
  journalEntry: row.journal_entry,
  keyInsights: row.key_insights,
  challengesFaced: row.challenges_faced,
  winsCelebrated: row.wins_celebrated,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const todayISO = () => new Date().toISOString().slice(0, 10);

export function useReflections(date?: string) {
  const targetDate = useMemo(() => date ?? todayISO(), [date]);
  const actions = useDailyProgressStore(selectDailyProgressActions);

  const query = useQuery<Reflection[]>({
    queryKey: ["reflections", targetDate],
    queryFn: async () => {
      const response = await apiFetch<ApiResponse<ReflectionsResponse>>(
        `/api/reflections?date=${encodeURIComponent(targetDate)}`,
      );
      return response.data.reflections.map(transformReflection);
    },
    staleTime: 1000 * 60,
  });

  const reflectionsByType = useMemo(() => {
    const map: Partial<Record<ReflectionType, Reflection>> = {};
    if (query.data) {
      for (const reflection of query.data) {
        const current = map[reflection.type];
        if (!current) {
          map[reflection.type] = reflection;
        } else {
          map[reflection.type] =
            new Date(reflection.updatedAt) > new Date(current.updatedAt)
              ? reflection
              : current;
        }
      }
    }
    return map as Record<ReflectionType, Reflection | undefined>;
  }, [query.data]);

  useEffect(() => {
    if (!query.data) return;
    const completedTypes = new Set(query.data.map((item) => item.type));
    actions.setReflectionStatus("morning", completedTypes.has("morning"));
    actions.setReflectionStatus("midday", completedTypes.has("midday"));
    actions.setReflectionStatus("evening", completedTypes.has("evening"));
  }, [actions, query.data]);

  return {
    ...query,
    targetDate,
    reflectionsByType,
  };
}

export function useSaveReflectionMutation(date?: string) {
  const targetDate = date ?? todayISO();
  const queryClient = useQueryClient();
  const actions = useDailyProgressStore(selectDailyProgressActions);

  return useMutation({
    mutationFn: async (
      input: Omit<SaveReflectionInput, "date"> & { date?: string },
    ) => {
      const payload: SaveReflectionInput = {
        ...input,
        date: input.date ?? targetDate,
      };

      const response = await apiFetch<ApiResponse<ReflectionRow>>("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: payload.date,
          type: payload.type,
          virtue_focus: payload.virtueFocus ?? undefined,
          intention: payload.intention ?? undefined,
          lesson: payload.lesson ?? undefined,
          gratitude: payload.gratitude ?? undefined,
          challenge: payload.challenge ?? undefined,
          mood: typeof payload.mood === "number" ? payload.mood : undefined,
          journal_entry: payload.journalEntry ?? undefined,
          key_insights: payload.keyInsights ?? undefined,
          challenges_faced: payload.challengesFaced ?? undefined,
          wins_celebrated: payload.winsCelebrated ?? undefined,
        }),
      });

      return transformReflection(response.data);
    },
    onSuccess: (reflection) => {
      queryClient.setQueryData<Reflection[] | undefined>(
        ["reflections", targetDate],
        (existing) => {
          if (!existing) {
            return [reflection];
          }
          const other = existing.filter((item) => item.type !== reflection.type);
          return [...other, reflection];
        },
      );
      actions.setReflectionStatus(reflection.type, true);
    },
  });
}

export function useDeleteReflectionMutation(date?: string) {
  const targetDate = date ?? todayISO();
  const queryClient = useQueryClient();
  const actions = useDailyProgressStore(selectDailyProgressActions);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await apiFetch<ApiResponse<{ id: string }>>("/api/reflections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return id;
    },
    onSuccess: (id) => {
      const next = queryClient.setQueryData<Reflection[] | undefined>(
        ["reflections", targetDate],
        (existing) => existing?.filter((item) => item.id !== id) ?? [],
      );
      const reflections = next ?? [];
      const types = new Set(reflections.map((item) => item.type));
      actions.setReflectionStatus("morning", types.has("morning"));
      actions.setReflectionStatus("midday", types.has("midday"));
      actions.setReflectionStatus("evening", types.has("evening"));
    },
  });
}
