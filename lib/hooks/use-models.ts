import { useQuery } from "@tanstack/react-query";

interface AIModel {
  id: string;
  provider: string;
  provider_model_id: string;
  display_name: string;
  description: string | null;
  enabled: boolean;
  tier: 'free' | 'premium';
  price_cents: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  metadata: Record<string, any> | null;
  rate_limit_messages_per_day: number | null;
  trial_messages_allowed: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  purchased?: boolean;
  usageToday?: {
    used: number;
    limit: number;
  };
  trialMessagesRemaining?: number;
}

interface ModelsData {
  free: AIModel[];
  premium: AIModel[];
  userPreferences: {
    defaultModelId: string;
    personaOverrides: Record<string, string>;
  };
}

export function useModels() {
  return useQuery<ModelsData>({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const result = await response.json();
      // API wraps response in { success: true, data: {...} }
      return result.data || result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useModelTrialStatus(modelId: string) {
  return useQuery({
    queryKey: ['model-trial-status', modelId],
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}/trial-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch trial status');
      }
      const result = await response.json();
      return result.data || result;
    },
    enabled: !!modelId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useModelUsage(modelId: string) {
  return useQuery({
    queryKey: ['model-usage', modelId],
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}/usage`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage');
      }
      const result = await response.json();
      return result.data || result;
    },
    enabled: !!modelId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}