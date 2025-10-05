import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";
import type { Database } from "@/lib/supabase/types";

const ROUTE = "/api/models";

// Define types for the new tables (will be added to types.ts after migration)
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

interface ModelUsage {
  id: string;
  user_id: string;
  model_id: string;
  usage_type: 'trial' | 'paid';
  message_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  source: string;
  granted_at: string;
  expires_at: string | null;
}

interface Product {
  id: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  persona_id: string | null;
  model_id: string | null;
  active: boolean;
}

interface Profile {
  id: string;
  default_model_id: string | null;
  persona_model_overrides: Record<string, string> | null;
}

export async function GET(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to models", { method: "GET" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  try {
    // Get all enabled models
    const { data: models, error: modelsError } = await (supabase as any)
      .from('ai_models')
      .select('*')
      .eq('enabled', true)
      .order('tier', { ascending: false })
      .order('sort_order');

    if (modelsError) {
      logger.error("Failed to fetch models", modelsError);
      return respondWithError(logger, "Failed to load models", { status: 500 });
    }

    // Get user's entitlements with model IDs
    const { data: entitlements, error: entitlementsError } = await (supabase as any)
      .from('entitlements')
      .select(`
        product_id,
        products!inner(
          id,
          metadata
        )
      `)
      .eq('user_id', user.id);

    if (entitlementsError) {
      logger.warn('Failed to fetch entitlements', { error: entitlementsError, userId: user.id });
    } else {
      logger.info('Entitlements fetched', { 
        userId: user.id, 
        count: entitlements?.length || 0,
        entitlements: entitlements?.map((e: any) => ({
          productId: e.product_id,
          modelId: e.products?.metadata?.model_id
        }))
      });
    }

    // Get user's usage
    const { data: usage, error: usageError } = await (supabase as any)
      .from('model_usage')
      .select('model_id, message_count, last_reset_at')
      .eq('user_id', user.id);

    if (usageError) {
      logger.warn('Failed to fetch usage', { error: usageError, userId: user.id });
    }

    // Get user preferences
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('default_model_id, persona_model_overrides')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      logger.warn('Failed to fetch profile', { error: profileError, userId: user.id });
    }

    // Build response
    const freeModels = (models || []).filter((m: any) => m.tier === 'free');
    const premiumModels = (models || [])
      .filter((m: any) => m.tier === 'premium')
      .map((model: any) => {
        // Check if user has entitlement for this model
        // metadata.model_id is a JSON string value, so we need to compare carefully
        const entitlement = (entitlements || []).find((e: any) => {
          const productModelId = e.products?.metadata?.model_id;
          return productModelId && productModelId === model.id;
        });
        
        const modelUsage = (usage || []).find((u: any) => u.model_id === model.id) || {
          message_count: 0,
          last_reset_at: new Date().toISOString()
        };

        return {
          ...model,
          purchased: !!entitlement,
          usageToday: {
            used: modelUsage.message_count,
            limit: model.metadata?.rate_limit_messages_per_day || 100
          },
          trialMessagesRemaining: Math.max(0, (model.metadata?.trial_messages_allowed || 5) - modelUsage.message_count)
        };
      });

    const userPreferences = {
      defaultModelId: profile?.default_model_id || 'gpt-4o-mini',
      personaOverrides: profile?.persona_model_overrides || {}
    };

    logger.info('Models fetched', {
      userId: user.id,
      freeCount: freeModels.length,
      premiumCount: premiumModels.length
    });

    return respondWithSuccess(logger, {
      free: freeModels,
      premium: premiumModels,
      userPreferences
    });

  } catch (error) {
    logger.error('Failed to fetch models', { error });
    return respondWithError(logger, "Internal server error", { status: 500 });
  }
}