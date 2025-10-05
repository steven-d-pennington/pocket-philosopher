import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/models/[modelId]/trial-status";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    const resolvedParams = await params;
    logger.warn("Unauthorized access to trial status", { method: "GET", modelId: resolvedParams.modelId });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  try {
    const { modelId } = await params;

    // Get model details
    const { data: model, error: modelError } = await (supabase as any)
      .from('ai_models')
      .select('id, tier, metadata')
      .eq('id', modelId)
      .eq('is_active', true)
      .single();

    if (modelError || !model) {
      logger.warn("Model not found", { modelId });
      return respondWithError(logger, "Model not found", { status: 404 });
    }

    // Only premium models have trials
    if (model.tier !== 'premium') {
      logger.warn("Trial status requested for non-premium model", { modelId, tier: model.tier });
      return respondWithError(logger, "Trials only available for premium models", { status: 400 });
    }

    // Check if user has entitlement (already purchased)
    const { data: entitlement, error: entitlementError } = await (supabase as any)
      .from('entitlements')
      .select('id, products!inner(model_id)')
      .eq('user_id', user.id)
      .eq('products.model_id', modelId)
      .single();

    if (entitlement) {
      // User has purchased this model
      return respondWithSuccess(logger, {
        modelId,
        hasAccess: true,
        accessType: 'purchased',
        trialMessagesRemaining: 0,
        trialMessagesAllowed: model.metadata?.trial_messages_allowed || 5
      });
    }

    // Get current usage for trial
    const { data: usage, error: usageError } = await (supabase as any)
      .from('model_usage')
      .select('message_count, usage_type, last_used_at')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .eq('usage_type', 'trial')
      .single();

    const trialMessagesAllowed = model.metadata?.trial_messages_allowed || 5;
    const trialMessagesUsed = usage?.message_count || 0;
    const trialMessagesRemaining = Math.max(0, trialMessagesAllowed - trialMessagesUsed);

    // Check if trial is expired (e.g., 30 days from first use)
    let trialExpired = false;
    if (usage?.last_used_at) {
      const lastUsed = new Date(usage.last_used_at);
      const trialExpiryDays = model.metadata?.trial_expiry_days || 30;
      const expiryDate = new Date(lastUsed.getTime() + (trialExpiryDays * 24 * 60 * 60 * 1000));
      trialExpired = new Date() > expiryDate;
    }

    const hasTrialAccess = trialMessagesRemaining > 0 && !trialExpired;

    logger.info("Trial status retrieved", {
      userId: user.id,
      modelId,
      trialMessagesUsed,
      trialMessagesRemaining,
      trialExpired,
      hasTrialAccess
    });

    return respondWithSuccess(logger, {
      modelId,
      hasAccess: hasTrialAccess,
      accessType: 'trial',
      trialMessagesRemaining,
      trialMessagesAllowed,
      trialExpired,
      lastUsedAt: usage?.last_used_at || null
    });

  } catch (error) {
    const resolvedParams = await params;
    logger.error("Failed to get trial status", { error, modelId: resolvedParams.modelId });
    return respondWithError(logger, "Internal server error", { status: 500 });
  }
}