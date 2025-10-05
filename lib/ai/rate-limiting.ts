import type { Database } from "@/lib/supabase/types";

export interface RateLimitConfig {
  messagesPerDay: number;
  messagesPerHour?: number;
  messagesPerMinute?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  messagesRemaining: number;
  resetTime?: Date;
  reason?: string;
}

/**
 * Service for handling rate limiting logic
 */
export class RateLimitingService {
  /**
   * Checks if a user can make a request to a model based on rate limits
   */
  static async checkRateLimit(
    userId: string,
    modelId: string,
    supabase: any
  ): Promise<RateLimitResult> {
    // Get model configuration
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('rate_limit_messages_per_day, tier')
      .eq('id', modelId)
      .eq('enabled', true)
      .single();

    if (modelError || !model) {
      return {
        allowed: false,
        messagesRemaining: 0,
        reason: 'Model not found'
      };
    }

    const config: RateLimitConfig = {
      messagesPerDay: model.rate_limit_messages_per_day || 100,
    };

    // For free tier, always apply rate limits
    // For premium, only apply if user doesn't have unlimited access
    if (model.tier === 'free') {
      return this.checkDailyLimit(userId, modelId, config, supabase);
    }

    // Check if user has premium access (no rate limits)
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('id, products!inner(metadata)')
      .eq('user_id', userId);

    // Find entitlement that matches this model
    const entitlement = entitlements?.find((e: any) => 
      e.products?.metadata?.model_id === modelId
    );

    if (entitlement) {
      // Premium user with purchased access - no rate limits
      return {
        allowed: true,
        messagesRemaining: -1 // Unlimited
      };
    }

    // Trial user - apply rate limits
    return this.checkDailyLimit(userId, modelId, config, supabase);
  }

  /**
   * Checks daily message limit
   */
  private static async checkDailyLimit(
    userId: string,
    modelId: string,
    config: RateLimitConfig,
    supabase: any
  ): Promise<RateLimitResult> {
    // Get usage for this user/model
    const { data: usage, error: usageError } = await supabase
      .from('model_usage')
      .select('message_count, last_reset_at')
      .eq('user_id', userId)
      .eq('model_id', modelId)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      // If we can't check usage, allow the request but log the error
      console.error('Failed to check usage for rate limiting:', usageError);
      return {
        allowed: true,
        messagesRemaining: config.messagesPerDay
      };
    }

    // Check if we need to reset the counter (new day)
    const today = new Date().toISOString().slice(0, 10);
    const lastReset = usage?.last_reset_at ? new Date(usage.last_reset_at).toISOString().slice(0, 10) : null;
    
    let messagesUsedToday = 0;
    if (usage && lastReset === today) {
      messagesUsedToday = usage.message_count || 0;
    }

    const messagesRemaining = Math.max(0, config.messagesPerDay - messagesUsedToday);

    if (messagesUsedToday >= config.messagesPerDay) {
      // Calculate reset time (next day)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return {
        allowed: false,
        messagesRemaining: 0,
        resetTime: tomorrow,
        reason: `Daily limit of ${config.messagesPerDay} messages exceeded`
      };
    }

    return {
      allowed: true,
      messagesRemaining
    };
  }

  /**
   * Records a message usage for rate limiting purposes
   */
  static async recordMessage(
    userId: string,
    modelId: string,
    supabase: any
  ): Promise<void> {
    // Get existing usage record for this user/model
    const { data: existingUsage } = await supabase
      .from('model_usage')
      .select('id, message_count')
      .eq('user_id', userId)
      .eq('model_id', modelId)
      .single();

    if (existingUsage) {
      // Update existing record
      const { error } = await supabase
        .from('model_usage')
        .update({
          message_count: existingUsage.message_count + 1,
        })
        .eq('id', existingUsage.id);

      if (error) {
        throw new Error('Failed to update usage record');
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('model_usage')
        .insert({
          user_id: userId,
          model_id: modelId,
          message_count: 1,
        });

      if (error) {
        throw new Error('Failed to create usage record');
      }
    }
  }
}