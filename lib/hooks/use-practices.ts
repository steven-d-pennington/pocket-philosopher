"use client";

import { useEffect } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/supabase/types";
import {
  selectPracticesActions,
  usePracticesStore,
  type Practice,
  type PracticeFrequency,
} from "@/lib/stores/practices-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

type PracticeRow = Database["public"]["Tables"]["habits"]["Row"];

interface PracticesResponse {
  practices: PracticeRow[];
}

interface CreatePracticeInput {
  name: string;
  description?: string | null;
  virtue: string;
  frequency: PracticeFrequency;
  reminderTime?: string | null;
  difficulty?: "easy" | "medium" | "hard";
  trackingType?: string;
  targetValue?: number | null;
  tags?: string[];
  activeDays?: number[] | null;
}

const difficultyMap = new Set(["easy", "medium", "hard"]);
const frequencyMap = new Set(["daily", "weekly", "custom"]);

const transformPractice = (row: PracticeRow): Practice => {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  const tags = Array.isArray(metadata.tags)
    ? (metadata.tags.filter((tag) => typeof tag === "string") as string[])
    : undefined;

  const difficulty = row.difficulty_level && difficultyMap.has(row.difficulty_level)
    ? (row.difficulty_level as Practice["difficulty"])
    : undefined;

  const frequency = row.frequency && frequencyMap.has(row.frequency)
    ? (row.frequency as PracticeFrequency)
    : "daily";

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    virtue: row.virtue,
    status: row.is_archived ? "archived" : "active",
    frequency,
    reminderTime: row.reminder_time ?? null,
    difficulty,
    sortOrder: row.sort_order ?? 0,
    tags,
    trackingType: row.tracking_type ?? undefined,
    targetValue: row.target_value ?? null,
    activeDays: row.active_days ?? null,
  };
};

const transformPractices = (rows: PracticeRow[]) => rows.map(transformPractice);

const buildPracticeUpdatePayload = (
  input: UpdatePracticeInput,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = { id: input.id };

  if ("name" in input && typeof input.name !== "undefined") payload.name = input.name;
  if ("description" in input)
    payload.description = input.description === "" ? null : input.description ?? null;
  if ("virtue" in input && typeof input.virtue !== "undefined") payload.virtue = input.virtue;
  if ("frequency" in input && typeof input.frequency !== "undefined")
    payload.frequency = input.frequency;
  if ("reminderTime" in input)
    payload.reminder_time = input.reminderTime ? input.reminderTime : null;
  if ("difficulty" in input && typeof input.difficulty !== "undefined")
    payload.difficulty_level = input.difficulty ?? null;
  if ("trackingType" in input && typeof input.trackingType !== "undefined")
    payload.tracking_type = input.trackingType ?? null;
  if ("targetValue" in input && typeof input.targetValue !== "undefined")
    payload.target_value = input.targetValue;
  if ("activeDays" in input && typeof input.activeDays !== "undefined")
    payload.active_days = input.activeDays ?? null;
  if ("isArchived" in input && typeof input.isArchived !== "undefined")
    payload.is_archived = input.isArchived;
  if ("sortOrder" in input && typeof input.sortOrder !== "undefined")
    payload.sort_order = input.sortOrder;

  return payload;
};

export function usePractices() {
  const actions = usePracticesStore(selectPracticesActions);

  const query = useQuery({
    queryKey: ["practices"],
    queryFn: async () => {
      const result = await apiFetch<ApiResponse<PracticesResponse>>("/api/practices");
      return transformPractices(result.data.practices);
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

export function useCreatePracticeMutation() {
  const queryClient = useQueryClient();
  const actions = usePracticesStore(selectPracticesActions);

  return useMutation({
    mutationFn: async (input: CreatePracticeInput) => {
      const tags = input.tags && input.tags.length > 0 ? input.tags : undefined;

      const payload = await apiFetch<ApiResponse<PracticeRow>>("/api/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          practice: {
            name: input.name,
            description: input.description,
            virtue: input.virtue,
            frequency: input.frequency,
            reminder_time: input.reminderTime ?? undefined,
            difficulty_level: input.difficulty ?? undefined,
            tracking_type: input.trackingType ?? "boolean",
            target_value: input.targetValue ?? null,
            active_days: input.activeDays ?? undefined,
            metadata: tags ? { tags } : undefined,
          },
        }),
      });

      return transformPractice(payload.data);
    },
    onSuccess: (practice) => {
      actions.upsertPractice(practice);
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
  });
}

export function useUpdatePracticeMutation() {
  const queryClient = useQueryClient();
  const actions = usePracticesStore(selectPracticesActions);

  return useMutation({
    mutationFn: async (input: UpdatePracticeInput) => {
      const payload = await apiFetch<ApiResponse<PracticeRow>>("/api/practices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPracticeUpdatePayload(input)),
      });

      return transformPractice(payload.data);
    },
    onSuccess: (practice) => {
      actions.upsertPractice(practice);
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
  });
}

export function useDeletePracticeMutation() {
  const queryClient = useQueryClient();
  const actions = usePracticesStore(selectPracticesActions);

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<ApiResponse<{ id: string }>>("/api/practices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return id;
    },
    onSuccess: (id) => {
      actions.removePractice(id);
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
  });
}

export function useReorderPracticesMutation() {
  const queryClient = useQueryClient();
  const actions = usePracticesStore(selectPracticesActions);

  return useMutation({
    mutationFn: async (order: { id: string; sortOrder: number }[]) => {
      await apiFetch<ApiResponse<{ order: { id: string; sort_order: number }[] }>>("/api/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          order: order.map((item) => ({ id: item.id, sort_order: item.sortOrder })),
        }),
      });
      return order;
    },
    onMutate: async (order) => {
      const previous = usePracticesStore
        .getState()
        .practices.map((practice) => ({ ...practice }));
      actions.reorderPractices(order);
      return { previous };
    },
    onError: (_error, _order, context) => {
      if (context?.previous) {
        actions.setPractices(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["practices"] });
    },
  });
}

export type { CreatePracticeInput };

export type PracticeUpdateInput = UpdatePracticeInput;

interface UpdatePracticeInput {
  id: string;
  name?: string;
  description?: string | null;
  virtue?: string;
  frequency?: PracticeFrequency;
  reminderTime?: string | null;
  difficulty?: Practice["difficulty"] | null;
  trackingType?: string | null;
  targetValue?: number | null;
  activeDays?: number[] | null;
  isArchived?: boolean;
  sortOrder?: number;
}
