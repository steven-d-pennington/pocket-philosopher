import { createRouteContext } from "@/app/api/_lib/supabase-route";
import {
  createApiRequestLogger,
  respondWithError,
  respondWithSuccess,
  withUserContext,
} from "@/app/api/_lib/logger";
import { z } from "zod";

const ROUTE = "/api/profile/model-preferences";

const updatePreferencesSchema = z.object({
  defaultModelId: z.string().optional(),
  personaOverrides: z.record(z.string()).optional(),
});

export async function PATCH(request: Request) {
  const baseLogger = createApiRequestLogger(request, ROUTE);
  const { supabase, user } = await createRouteContext();
  const logger = withUserContext(baseLogger, user?.id);

  if (!user) {
    logger.warn("Unauthorized access to model preferences", { method: "PATCH" });
    return respondWithError(logger, "Unauthorized", { status: 401 });
  }

  try {
    const json = await request.json().catch(() => null);
    const parseResult = updatePreferencesSchema.safeParse(json);

    if (!parseResult.success) {
      logger.warn("Invalid preferences payload", { issues: parseResult.error.flatten() });
      return respondWithError(logger, "Invalid payload", {
        status: 400,
        details: parseResult.error.flatten(),
      });
    }

    const { defaultModelId, personaOverrides } = parseResult.data;

    // Validate that the default model exists and is accessible
    if (defaultModelId) {
      const { data: model, error: modelError } = await (supabase as any)
        .from('ai_models')
        .select('id, tier')
        .eq('id', defaultModelId)
        .eq('is_active', true)
        .single();

      if (modelError || !model) {
        logger.warn("Invalid default model ID", { modelId: defaultModelId });
        return respondWithError(logger, "Invalid model ID", { status: 400 });
      }

      // If premium model, check entitlement
      if (model.tier === 'premium') {
        const { data: entitlement, error: entitlementError } = await (supabase as any)
          .from('entitlements')
          .select('id, products!inner(model_id)')
          .eq('user_id', user.id)
          .eq('products.model_id', defaultModelId)
          .single();

        if (entitlementError || !entitlement) {
          logger.warn("No entitlement for premium model", { modelId: defaultModelId, userId: user.id });
          return respondWithError(logger, "No access to premium model", { status: 403 });
        }
      }
    }

    // Validate persona overrides
    if (personaOverrides) {
      for (const [personaId, modelId] of Object.entries(personaOverrides)) {
        const { data: model, error: modelError } = await (supabase as any)
          .from('ai_models')
          .select('id, tier')
          .eq('id', modelId)
          .eq('is_active', true)
          .single();

        if (modelError || !model) {
          logger.warn("Invalid persona override model ID", { personaId, modelId });
          return respondWithError(logger, "Invalid model ID in persona overrides", { status: 400 });
        }

        // If premium model, check entitlement
        if (model.tier === 'premium') {
          const { data: entitlement, error: entitlementError } = await (supabase as any)
            .from('entitlements')
            .select('id, products!inner(model_id)')
            .eq('user_id', user.id)
            .eq('products.model_id', modelId)
            .single();

          if (entitlementError || !entitlement) {
            logger.warn("No entitlement for premium model in persona override", {
              personaId,
              modelId,
              userId: user.id
            });
            return respondWithError(logger, "No access to premium model in persona overrides", { status: 403 });
          }
        }
      }
    }

    // Update user preferences
    const updates: any = {};
    if (defaultModelId !== undefined) updates.default_model_id = defaultModelId;
    if (personaOverrides !== undefined) updates.persona_model_overrides = personaOverrides;

    const { data, error: updateError } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('default_model_id, persona_model_overrides')
      .single();

    if (updateError) {
      logger.error("Failed to update model preferences", updateError);
      return respondWithError(logger, "Failed to update preferences", { status: 500 });
    }

    logger.info("Model preferences updated", {
      userId: user.id,
      defaultModelId,
      personaOverridesCount: Object.keys(personaOverrides || {}).length
    });

    return respondWithSuccess(logger, data);

  } catch (error) {
    logger.error("Failed to update model preferences", { error });
    return respondWithError(logger, "Internal server error", { status: 500 });
  }
}