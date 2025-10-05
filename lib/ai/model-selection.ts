import type { Database } from "@/lib/supabase/types";

// Define types for the new tables (will be added to types.ts after migration)
export interface AIModel {
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
}

export interface ModelUsage {
  id: string;
  user_id: string;
  model_id: string;
  message_count: number;
  trial_messages_used: number;
  last_reset_at: string;
  created_at: string;
}

export interface ModelSelectionResult {
  model: AIModel;
  accessType: 'free' | 'trial' | 'paid';
  messagesRemaining?: number;
  trialExpired?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  messagesRemaining: number;
  resetTime?: Date;
  reason?: string;
}

/**
 * Service for handling AI model selection logic
 */
export class ModelSelectionService {
  /**
   * Selects the best available model for a user based on their preferences and entitlements
   */
  static async selectModelForUser(
    userId: string,
    requestedModelId: string | null,
    personaId: string | null,
    supabase: any
  ): Promise<ModelSelectionResult> {
    // Get user preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('default_model_id, persona_model_overrides')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // Determine which model to use
    let selectedModelId = requestedModelId;

    if (!selectedModelId) {
      // Check persona-specific override
      if (personaId && profile?.persona_model_overrides?.[personaId]) {
        selectedModelId = profile.persona_model_overrides[personaId];
      } else {
        // Use default model
        selectedModelId = profile?.default_model_id || 'gpt-4o-mini';
      }
    }

    // Get model details
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('id', selectedModelId)
      .eq('enabled', true)
      .single();

    if (modelError || !model) {
      throw new Error('Requested model not found or inactive');
    }

    // Check access for premium models
    if (model.tier === 'premium') {
      if (!selectedModelId) {
        throw new Error('Model ID is required for premium models');
      }
      const accessCheck = await this.checkPremiumAccess(userId, selectedModelId, supabase);
      return {
        model,
        ...accessCheck
      };
    }

    // Free model - always accessible
    return {
      model,
      accessType: 'free'
    };
  }

  /**
   * Checks if a user has access to a premium model (purchased or trial)
   */
  static async checkPremiumAccess(
    userId: string,
    modelId: string,
    supabase: any
  ): Promise<{ accessType: 'trial' | 'paid'; messagesRemaining?: number; trialExpired?: boolean }> {
    // Check if user has purchased this model
    const { data: entitlements, error: entitlementError } = await supabase
      .from('entitlements')
      .select(`
        id,
        products!inner(metadata)
      `)
      .eq('user_id', userId);

    // Check if any entitlement matches this model
    const entitlement = entitlements?.find((e: any) =>
      e.products?.metadata?.model_id === modelId
    );

    if (entitlement) {
      return { accessType: 'paid' };
    }

    // Check trial access
    const { data: usage, error: usageError } = await supabase
      .from('model_usage')
      .select('message_count, trial_messages_used, last_reset_at, created_at')
      .eq('user_id', userId)
      .eq('model_id', modelId)
      .single();

    const { data: model } = await supabase
      .from('ai_models')
      .select('trial_messages_allowed')
      .eq('id', modelId)
      .single();

    const trialMessagesAllowed = model?.trial_messages_allowed || 5;
    const trialMessagesUsed = usage?.trial_messages_used || 0;
    const trialMessagesRemaining = Math.max(0, trialMessagesAllowed - trialMessagesUsed);

    // Check if trial is expired
    let trialExpired = false;
    if (usage?.last_reset_at) {
      const lastReset = new Date(usage.last_reset_at);
      const trialExpiryDays = 30; // Default trial period
      const expiryDate = new Date(lastReset.getTime() + (trialExpiryDays * 24 * 60 * 60 * 1000));
      trialExpired = new Date() > expiryDate;
    }

    if (trialMessagesRemaining > 0 && !trialExpired) {
      return {
        accessType: 'trial',
        messagesRemaining: trialMessagesRemaining,
        trialExpired: false
      };
    }

    throw new Error('No access to premium model');
  }

  /**
   * Records usage for a model interaction
   */
  static async recordUsage(
    userId: string,
    modelId: string,
    accessType: 'free' | 'trial' | 'paid',
    supabase: any
  ): Promise<void> {
    // Increment message count for this user/model combination
    const { data: existing } = await supabase
      .from('model_usage')
      .select('message_count, trial_messages_used')
      .eq('user_id', userId)
      .eq('model_id', modelId)
      .single();

    if (existing) {
      // Update existing record
      const updates: any = {
        message_count: existing.message_count + 1,
      };
      
      if (accessType === 'trial') {
        updates.trial_messages_used = existing.trial_messages_used + 1;
      }

      const { error } = await supabase
        .from('model_usage')
        .update(updates)
        .eq('user_id', userId)
        .eq('model_id', modelId);

      if (error) {
        throw new Error('Failed to record usage');
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('model_usage')
        .insert({
          user_id: userId,
          model_id: modelId,
          message_count: 1,
          trial_messages_used: accessType === 'trial' ? 1 : 0,
        });

      if (error) {
        throw new Error('Failed to record usage');
      }
    }
  }
}