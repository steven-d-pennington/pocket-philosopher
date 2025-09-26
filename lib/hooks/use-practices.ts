"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  selectPracticesActions,
  usePracticesStore,
  type Practice,
} from "@/lib/stores/practices-store";

import type { ApiResponse } from "./use-api";
import { apiFetch } from "./use-api";

export interface PracticesResponse {
  practices: Practice[];
}

export function usePractices() {
  const actions = usePracticesStore(selectPracticesActions);

  const query = useQuery({
    queryKey: ["practices"],
    queryFn: async () => {
      const result = await apiFetch<ApiResponse<PracticesResponse>>("/api/practices");
      return result.data.practices;
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
