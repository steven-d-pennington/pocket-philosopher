import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";

const ROUTE = "/api/models/[modelId]/usage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    const resolvedParams = await params;
    logger.warn("Unauthorized access to usage stats", { method: "GET", modelId: resolvedParams.modelId });
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

    // Get current usage
    const { data: usage, error: usageError } = await (supabase as any)
      .from('model_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_id', modelId);

    if (usageError) {
      logger.warn('Failed to fetch usage', { error: usageError, userId: user.id, modelId });
    }

    // Calculate usage stats
    const trialUsage = usage?.find((u: any) => u.usage_type === 'trial') || {
      message_count: 0,
      last_used_at: null,
      created_at: null
    };

    const paidUsage = usage?.find((u: any) => u.usage_type === 'paid') || {
      message_count: 0,
      last_used_at: null,
      created_at: null
    };

    // Get rate limits from model metadata
    const rateLimitMessagesPerDay = model.metadata?.rate_limit_messages_per_day || 100;
    const trialMessagesAllowed = model.metadata?.trial_messages_allowed || 5;

    // Calculate remaining messages for today
    const today = new Date().toISOString().slice(0, 10);
    let messagesToday = 0;

    // Count messages used today (this is a simplified calculation)
    // In a real implementation, you'd want a more sophisticated daily counter
    if (paidUsage.last_used_at?.startsWith(today)) {
      messagesToday = paidUsage.message_count;
    }

    const messagesRemainingToday = Math.max(0, rateLimitMessagesPerDay - messagesToday);

    logger.info("Usage stats retrieved", {
      userId: user.id,
      modelId,
      trialMessages: trialUsage.message_count,
      paidMessages: paidUsage.message_count,
      messagesToday,
      messagesRemainingToday
    });

    return respondWithSuccess(logger, {
      modelId,
      tier: model.tier,
      usage: {
        trial: {
          messagesUsed: trialUsage.message_count,
          messagesAllowed: trialMessagesAllowed,
          lastUsedAt: trialUsage.last_used_at,
          firstUsedAt: trialUsage.created_at
        },
        paid: {
          messagesUsed: paidUsage.message_count,
          lastUsedAt: paidUsage.last_used_at,
          firstUsedAt: paidUsage.created_at
        },
        today: {
          messagesUsed: messagesToday,
          messagesRemaining: messagesRemainingToday,
          limit: rateLimitMessagesPerDay
        }
      }
    });

  } catch (error) {
    const resolvedParams = await params;
    logger.error("Failed to get usage stats", { error, modelId: resolvedParams.modelId });
    return respondWithError(logger, "Internal server error", { status: 500 });
  }
}