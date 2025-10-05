# AI Model Selection Feature

**Created**: October 4, 2025
**Status**: Planning Phase
**Priority**: High - Monetization Opportunity + User Experience Enhancement

---

## Overview

The AI Model Selection feature empowers users to choose which AI models power their philosophical coaches, with both free and premium model options. Users can select a global default model in their settings, with the option to override on a per-persona basis. Premium models are monetized as one-time unlocks ($2.99-$4.99) following the existing freemium pattern. Administrators manage the model catalog, including pricing, availability, and usage limits.

**Business Value**:
- **New Revenue Stream**: Premium model unlocks create additional monetization beyond coach purchases
- **User Control**: Power users can optimize for speed, quality, or cost based on their needs
- **Flexibility**: Easy to add new models as AI providers release them
- **Competitive Edge**: Differentiation from competitors with fixed models

**User Impact**:
- Free users get access to high-quality free models (GPT-4o-mini, Claude Haiku)
- Premium users can unlock advanced models for deeper philosophical insights
- Users can experiment with different models to find their preference
- Inline trial messaging allows users to experience premium models before purchase

---

## Architecture

### Technical Approach

**Model Catalog System**:
- Database-driven model registry (`ai_models` table)
- Admin-configurable pricing, availability, and metadata
- Reuse existing entitlement system for model purchases
- Per-user rate limiting for premium models

**User Preference Storage**:
- Global default model stored in `profiles.default_model_id`
- Per-persona overrides stored in `profiles.persona_model_overrides` (JSONB)
- Fallback to system default if user hasn't selected

**Request Flow**:
```
User sends message to coach
  ↓
1. Get user's persona preference (persona_model_overrides[personaId])
2. If no override, use user's default_model_id
3. If no default, use system default (GPT-4o-mini)
4. Check entitlement (free models skip check)
5. Check rate limits for premium models
6. Route to AI orchestrator with selected model
```

### Integration Points

**Existing Systems**:
- **Entitlements System**: Reuse `products`, `purchases`, `entitlements` tables
- **Stripe Integration**: Same checkout flow as coach purchases
- **AI Orchestrator**: Pass `modelId` parameter to provider selection logic
- **Provider Registry**: Map model IDs to provider-specific model names

**New Components**:
- Model catalog management (admin)
- Model selection UI (user settings)
- Rate limiting service
- Trial message tracking

---

## Feature Requirements

### Phase 1: Database Schema & Model Catalog ⏸️ Not Started

**Deliverables**:
- Create `ai_models` table with catalog schema
- Add model preference columns to `profiles` table
- Create `model_usage` table for rate limiting
- Seed initial model catalog with free and premium options
- Add model SKUs to `products` table for monetization

**Database Changes**:
```sql
-- Model catalog
CREATE TABLE ai_models (
  id VARCHAR(50) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'together', 'google'
  provider_model_id VARCHAR(100) NOT NULL, -- 'gpt-4o', 'claude-3-5-sonnet-20241022'
  display_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  tier VARCHAR(20) NOT NULL, -- 'free' or 'premium'
  price_cents INT, -- NULL for free models
  stripe_product_id TEXT, -- For premium models
  stripe_price_id TEXT,
  metadata JSONB, -- { speed, quality, contextWindow, costPer1MTok, bestFor[] }
  rate_limit_messages_per_day INT, -- NULL = unlimited
  trial_messages_allowed INT DEFAULT 0, -- Free trial messages for premium models
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
ALTER TABLE profiles
  ADD COLUMN default_model_id VARCHAR(50) REFERENCES ai_models(id),
  ADD COLUMN persona_model_overrides JSONB; -- { "marcus": "gpt-4o", "lao": "claude-opus" }

-- Rate limiting and trial tracking
CREATE TABLE model_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  model_id VARCHAR(50) REFERENCES ai_models(id),
  message_count INT DEFAULT 1,
  trial_messages_used INT DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id)
);

-- Indexes
CREATE INDEX idx_ai_models_enabled ON ai_models(enabled) WHERE enabled = true;
CREATE INDEX idx_ai_models_tier ON ai_models(tier);
CREATE INDEX idx_model_usage_user ON model_usage(user_id);
CREATE INDEX idx_model_usage_reset ON model_usage(last_reset_at);

-- RLS Policies
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Models are viewable by all authenticated users"
  ON ai_models FOR SELECT
  TO authenticated
  USING (enabled = true);

ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage"
  ON model_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage"
  ON model_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Initial Model Catalog Seed**:
```sql
-- Free Models
INSERT INTO ai_models (id, provider, provider_model_id, display_name, description, enabled, tier, metadata, rate_limit_messages_per_day, sort_order) VALUES
('gpt-4o-mini', 'openai', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast, efficient model ideal for most conversations. Good balance of speed and quality.', true, 'free', '{"speed": "fast", "quality": "good", "contextWindow": 128000, "costPer1MTok": 0.15, "bestFor": ["Quick responses", "Daily coaching", "General advice"]}', NULL, 1),
('claude-3-5-haiku', 'anthropic', 'claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'Anthropic''s fastest model with strong reasoning capabilities.', true, 'free', '{"speed": "fastest", "quality": "good", "contextWindow": 200000, "costPer1MTok": 0.25, "bestFor": ["Speed", "Analysis", "Quick insights"]}', NULL, 2),
('llama-3.1-8b', 'together', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'Llama 3.1 8B', 'Open-source model running on Together AI. Fast and capable.', true, 'free', '{"speed": "fast", "quality": "good", "contextWindow": 131072, "costPer1MTok": 0.18, "bestFor": ["Open source", "Privacy-conscious", "Experimentation"]}', NULL, 3);

-- Premium Models
INSERT INTO ai_models (id, provider, provider_model_id, display_name, description, enabled, tier, price_cents, metadata, rate_limit_messages_per_day, trial_messages_allowed, sort_order) VALUES
('gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', 'OpenAI''s most advanced multimodal model. Exceptional reasoning and philosophical depth.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 128000, "costPer1MTok": 2.50, "bestFor": ["Deep analysis", "Complex questions", "Nuanced reasoning"]}', 50, 2, 10),
('claude-3-5-sonnet', 'anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Anthropic''s flagship model. Outstanding at philosophical discussion and ethical reasoning.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 200000, "costPer1MTok": 3.00, "bestFor": ["Philosophical depth", "Ethical reasoning", "Long-form responses"]}', 50, 2, 11),
('claude-3-opus', 'anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Anthropic''s most intelligent model. Unmatched for deep philosophical exploration.', true, 'premium', 499, '{"speed": "slower", "quality": "exceptional", "contextWindow": 200000, "costPer1MTok": 15.00, "bestFor": ["Maximum depth", "Complex philosophy", "Extended dialogues"]}', 30, 2, 12),
('gemini-pro-1.5', 'google', 'gemini-1.5-pro-latest', 'Gemini 1.5 Pro', 'Google''s advanced model with massive context window. Great for long conversations.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 2000000, "costPer1MTok": 1.25, "bestFor": ["Long context", "Multi-turn dialogue", "Reference-heavy discussions"]}', 50, 2, 13);
```

**Product SKUs for Stripe**:
```sql
-- Add to products table
INSERT INTO products (id, stripe_product_id, stripe_price_id, name, description, price_cents, type, metadata, active) VALUES
-- (Stripe IDs to be filled after Stripe product creation)
(uuid_generate_v4(), 'prod_MODEL_GPT4O', 'price_MODEL_GPT4O', 'GPT-4o Model Access', 'Unlock OpenAI''s GPT-4o model for all your coaches', 299, 'model', '{"model_id": "gpt-4o"}', true),
(uuid_generate_v4(), 'prod_MODEL_CLAUDE_SONNET', 'price_MODEL_CLAUDE_SONNET', 'Claude 3.5 Sonnet Model Access', 'Unlock Anthropic''s Claude 3.5 Sonnet model', 299, 'model', '{"model_id": "claude-3-5-sonnet"}', true),
(uuid_generate_v4(), 'prod_MODEL_CLAUDE_OPUS', 'price_MODEL_CLAUDE_OPUS', 'Claude 3 Opus Model Access', 'Unlock Anthropic''s most powerful Claude 3 Opus model', 499, 'model', '{"model_id": "claude-3-opus"}', true),
(uuid_generate_v4(), 'prod_MODEL_GEMINI', 'price_MODEL_GEMINI', 'Gemini 1.5 Pro Model Access', 'Unlock Google''s Gemini 1.5 Pro with massive context', 299, 'model', '{"model_id": "gemini-pro-1.5"}', true);
```

---

### Phase 2: Backend API & Business Logic ⏸️ Not Started

**Deliverables**:
- API endpoints for model catalog, preferences, and usage
- Model selection middleware in AI orchestrator
- Entitlement checking for premium models
- Rate limiting service with daily reset logic
- Trial message tracking
- Admin API endpoints for model management

**API Endpoints**:

#### User-Facing APIs

```typescript
// GET /api/models
// Get available models with user's entitlements and usage
Response: {
  data: {
    free: AIModel[],
    premium: AIModel[], // with purchaseStatus and usage info
    userPreferences: {
      defaultModelId: string,
      personaOverrides: Record<PersonaId, string>
    }
  }
}

// PATCH /api/profile/model-preferences
// Update user's model preferences
Request: {
  defaultModelId?: string,
  personaOverrides?: Record<PersonaId, string>
}

// GET /api/models/:modelId/trial-status
// Check trial message availability for premium model
Response: {
  data: {
    trialMessagesRemaining: number,
    totalTrialMessages: number,
    canUseTrial: boolean
  }
}

// GET /api/models/:modelId/usage
// Get user's usage stats for a model
Response: {
  data: {
    messagesUsedToday: number,
    dailyLimit: number | null,
    limitResetAt: string,
    hasUnlimitedAccess: boolean
  }
}
```

#### Admin APIs

```typescript
// GET /api/admin/models
// List all models with admin metadata
Response: {
  data: AIModel[], // includes disabled models
  meta: { total: number }
}

// POST /api/admin/models
// Create new model
Request: {
  id: string,
  provider: string,
  providerModelId: string,
  displayName: string,
  description: string,
  tier: 'free' | 'premium',
  priceCents?: number,
  metadata: ModelMetadata,
  rateLimitMessagesPerDay?: number,
  trialMessagesAllowed?: number
}

// PATCH /api/admin/models/:modelId
// Update model configuration
Request: Partial<AIModel>

// POST /api/admin/models/:modelId/enable
// Enable a disabled model
Response: { data: { enabled: true } }

// POST /api/admin/models/:modelId/disable
// Disable an active model
Response: { data: { enabled: false } }

// POST /api/admin/entitlements/grant-model
// Grant model access to user
Request: {
  userId: string,
  modelId: string,
  source: 'admin_grant' | 'purchase' | 'trial'
}

// GET /api/admin/models/:modelId/usage-stats
// Get aggregate usage statistics
Response: {
  data: {
    totalUsers: number,
    messagesLast24h: number,
    messagesLast7d: number,
    averageMessagesPerUser: number,
    topUsers: Array<{ userId: string, messageCount: number }>
  }
}
```

**Business Logic Implementation**:

```typescript
// lib/ai/model-selection.ts

interface ModelSelectionOptions {
  userId: string;
  personaId: string;
  messageContent?: string; // For trial tracking
}

async function selectModelForRequest(options: ModelSelectionOptions): Promise<{
  modelId: string;
  isTrialMessage: boolean;
  usageInfo: ModelUsageInfo;
}> {
  const { userId, personaId } = options;

  // 1. Get user preferences
  const profile = await getProfile(userId);
  const preferredModelId =
    profile.persona_model_overrides?.[personaId] ||
    profile.default_model_id ||
    'gpt-4o-mini'; // System default

  // 2. Get model info
  const model = await getModel(preferredModelId);
  if (!model?.enabled) {
    // Fallback to system default if preferred model disabled
    return selectModelForRequest({
      ...options,
      preferredModelId: 'gpt-4o-mini'
    });
  }

  // 3. Check entitlement for premium models
  if (model.tier === 'premium') {
    const hasAccess = await checkModelEntitlement(userId, model.id);
    const usage = await getModelUsage(userId, model.id);

    // Check trial messages
    if (!hasAccess && model.trial_messages_allowed > 0) {
      if (usage.trial_messages_used < model.trial_messages_allowed) {
        // Use trial message
        await incrementTrialUsage(userId, model.id);
        return {
          modelId: model.id,
          isTrialMessage: true,
          usageInfo: usage
        };
      } else {
        throw new Error('TRIAL_EXPIRED', {
          modelId: model.id,
          priceCents: model.price_cents
        });
      }
    }

    if (!hasAccess) {
      throw new Error('MODEL_LOCKED', {
        modelId: model.id,
        priceCents: model.price_cents
      });
    }

    // Check rate limits
    if (model.rate_limit_messages_per_day) {
      if (usage.message_count >= model.rate_limit_messages_per_day) {
        throw new Error('RATE_LIMIT_EXCEEDED', {
          modelId: model.id,
          resetAt: usage.last_reset_at
        });
      }
    }

    // Increment usage
    await incrementModelUsage(userId, model.id);
  }

  return {
    modelId: model.id,
    isTrialMessage: false,
    usageInfo: await getModelUsage(userId, model.id)
  };
}

// lib/ai/rate-limiting.ts

async function checkAndResetDailyLimits() {
  // Run as cron job or on first request each day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await supabase
    .from('model_usage')
    .update({
      message_count: 0,
      last_reset_at: new Date().toISOString()
    })
    .lt('last_reset_at', yesterday.toISOString());
}
```

**AI Orchestrator Integration**:

```typescript
// lib/ai/orchestrator.ts - Updated

async function* chat(
  message: string,
  personaId: string,
  userId: string,
  conversationId?: string
): AsyncGenerator<ChatChunk> {
  // NEW: Select model based on user preferences
  const { modelId, isTrialMessage, usageInfo } =
    await selectModelForRequest({ userId, personaId, message });

  // Get model details
  const model = await getModel(modelId);

  // Load user context
  const context = await aggregateUserContext(userId);

  // Retrieve relevant chunks
  const chunks = await retrieveChunks(message, personaId);

  // Build prompt
  const prompt = await buildPrompt({
    message,
    personaId,
    context,
    chunks,
    mode: 'coaching',
  });

  // NEW: Route to specific provider based on model
  const provider = await getProviderForModel(model);
  const stream = await provider.stream({
    messages: prompt.messages,
    model: model.provider_model_id, // Provider-specific model ID
    temperature: prompt.temperature,
  });

  // Stream response
  let fullContent = '';
  for await (const chunk of stream) {
    fullContent += chunk.content;
    yield {
      type: 'content',
      content: chunk.content,
    };
  }

  // NEW: Emit trial usage metadata if applicable
  if (isTrialMessage) {
    yield {
      type: 'metadata',
      data: {
        isTrialMessage: true,
        trialMessagesRemaining:
          model.trial_messages_allowed - usageInfo.trial_messages_used - 1,
        modelName: model.display_name,
        unlockPrice: model.price_cents
      }
    };
  }

  // Extract citations
  const citations = extractCitations(fullContent, chunks);
  yield { type: 'citations', citations };

  // Save to database
  await saveMessage({
    conversationId,
    role: 'assistant',
    content: fullContent,
    citations,
    context,
    metadata: {
      modelId: model.id,
      modelName: model.display_name,
      isTrialMessage
    }
  });
}
```

---

### Phase 3: User Settings UI ⏸️ Not Started

**Deliverables**:
- Model selection UI in user settings page
- Global default model dropdown
- Per-persona override controls (collapsible)
- Premium model cards with pricing and purchase buttons
- Trial message counter display
- Rate limit indicators
- Model comparison info cards

**Component Structure**:
```
app/(dashboard)/settings/
└── ai-models/
    └── page.tsx

components/settings/
├── model-selector.tsx           # Main settings component
├── model-dropdown.tsx           # Dropdown for model selection
├── model-card.tsx               # Premium model card with purchase button
├── model-metadata-badge.tsx     # Speed, quality, context badges
├── persona-override-list.tsx    # Per-persona override UI
└── trial-message-indicator.tsx  # Trial usage display
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ AI Model Settings                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Default Model for All Coaches                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ GPT-4o Mini (Free)                             ▼  │ │
│ └────────────────────────────────────────────────────┘ │
│ The model used for all coaches unless overridden below. │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⚙️ Advanced: Per-Persona Model Selection         ⌄ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Available Premium Models                                │
│ Unlock advanced models for deeper philosophical insights│
│                                                          │
│ ┌──────────────────────────────────────┐               │
│ │ 🔒 GPT-4o                       $2.99 │               │
│ │ OpenAI's most advanced model          │               │
│ │ ⚡ Standard  ⭐ Excellent  📝 128K    │               │
│ │ Best for: Deep analysis, Complex Q's  │               │
│ │ 2 free trial messages remaining       │               │
│ │            [Try Free] [Unlock $2.99]  │               │
│ └──────────────────────────────────────┘               │
│                                                          │
│ ┌──────────────────────────────────────┐               │
│ │ ✅ Claude 3.5 Sonnet           $2.99 │               │
│ │ Unlocked • 45/50 messages today       │               │
│ │ ⚡ Standard  ⭐ Excellent  📝 200K    │               │
│ └──────────────────────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Expanded Per-Persona Overrides**:
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Advanced: Per-Persona Model Selection                │
├─────────────────────────────────────────────────────────┤
│ Customize which model each coach uses. Leave "Use       │
│ Default" to use your default model selection.           │
│                                                          │
│ Marcus Aurelius                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Use Default (GPT-4o Mini)                      ▼  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Laozi                                                    │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Claude 3.5 Sonnet (Premium)                    ▼  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Simone de Beauvoir                                       │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Use Default (GPT-4o Mini)                      ▼  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
// components/settings/model-selector.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModelCard } from './model-card';
import { ModelDropdown } from './model-dropdown';
import { PersonaOverrideList } from './persona-override-list';

export function ModelSelector() {
  const queryClient = useQueryClient();
  const [showOverrides, setShowOverrides] = useState(false);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/models');
      return res.json();
    }
  });

  const { free, premium, userPreferences } = modelsData?.data || {
    free: [],
    premium: [],
    userPreferences: {}
  };

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (preferences: {
      defaultModelId?: string;
      personaOverrides?: Record<string, string>;
    }) => {
      const res = await fetch('/api/profile/model-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const handleDefaultChange = (modelId: string) => {
    updatePreferences.mutate({ defaultModelId: modelId });
  };

  return (
    <div className="space-y-6">
      {/* Default Model Selection */}
      <div>
        <label className="text-sm font-medium">
          Default Model for All Coaches
        </label>
        <ModelDropdown
          value={userPreferences.defaultModelId || 'gpt-4o-mini'}
          models={free}
          onChange={handleDefaultChange}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          The model used for all coaches unless overridden below.
        </p>
      </div>

      {/* Per-Persona Overrides (Collapsible) */}
      <div>
        <button
          onClick={() => setShowOverrides(!showOverrides)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          ⚙️ Advanced: Per-Persona Model Selection
          {showOverrides ? '▲' : '▼'}
        </button>
        {showOverrides && (
          <PersonaOverrideList
            overrides={userPreferences.personaOverrides || {}}
            availableModels={free}
            onUpdate={(overrides) =>
              updatePreferences.mutate({ personaOverrides: overrides })
            }
          />
        )}
      </div>

      {/* Premium Models */}
      <div>
        <h3 className="text-sm font-medium mb-2">Available Premium Models</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Unlock advanced models for deeper philosophical insights
        </p>
        <div className="space-y-4">
          {premium.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// components/settings/model-card.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/lib/hooks/use-analytics';

interface ModelCardProps {
  model: {
    id: string;
    displayName: string;
    description: string;
    priceCents: number;
    metadata: {
      speed: string;
      quality: string;
      contextWindow: number;
      bestFor: string[];
    };
    purchased: boolean;
    trialMessagesRemaining?: number;
    usageToday?: { used: number; limit: number };
  };
}

export function ModelCard({ model }: ModelCardProps) {
  const { capture } = useAnalytics();
  const [isTrialing, setIsTrialing] = useState(false);

  const handlePurchase = async () => {
    capture('model_purchase_initiated', { modelId: model.id });

    const res = await fetch('/api/purchases/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'model',
        modelId: model.id
      })
    });

    const { sessionId, url } = await res.json();
    window.location.href = url;
  };

  const handleTryFree = () => {
    capture('model_trial_started', { modelId: model.id });
    setIsTrialing(true);
    // Redirect to coach page or show tutorial
  };

  const price = (model.priceCents / 100).toFixed(2);
  const isLocked = !model.purchased;

  return (
    <Card className={`p-4 ${isLocked ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLocked && <span className="text-lg">🔒</span>}
          {!isLocked && <span className="text-lg">✅</span>}
          <h4 className="font-semibold">{model.displayName}</h4>
        </div>
        <Badge variant="outline">${price}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {model.description}
      </p>

      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary">⚡ {model.metadata.speed}</Badge>
        <Badge variant="secondary">⭐ {model.metadata.quality}</Badge>
        <Badge variant="secondary">
          📝 {(model.metadata.contextWindow / 1000).toFixed(0)}K
        </Badge>
      </div>

      {/* Best For */}
      <div className="text-xs text-muted-foreground mb-3">
        <strong>Best for:</strong> {model.metadata.bestFor.join(', ')}
      </div>

      {/* Status / Actions */}
      {model.purchased ? (
        <div className="text-sm">
          <Badge variant="outline" className="bg-green-50">
            Unlocked
          </Badge>
          {model.usageToday && (
            <span className="ml-2 text-xs text-muted-foreground">
              {model.usageToday.used}/{model.usageToday.limit} messages today
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          {model.trialMessagesRemaining > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTryFree}
              className="flex-1"
            >
              Try Free ({model.trialMessagesRemaining} left)
            </Button>
          )}
          <Button
            onClick={handlePurchase}
            size="sm"
            className="flex-1"
          >
            Unlock ${price}
          </Button>
        </div>
      )}
    </Card>
  );
}
```

---

### Phase 4: Admin Model Management UI ⏸️ Not Started

**Deliverables**:
- Admin model catalog page (`/admin/models`)
- Model create/edit forms
- Enable/disable toggle
- Pricing configuration
- Rate limit settings
- Grant model access to users
- Usage statistics dashboard

**Component Structure**:
```
app/admin/models/
├── page.tsx                    # Model list/table
├── [modelId]/
│   └── page.tsx                # Model detail/edit
└── new/
    └── page.tsx                # Create new model

components/admin/
├── model-table.tsx             # Admin model list
├── model-form.tsx              # Create/edit form
├── model-usage-stats.tsx       # Usage analytics
└── grant-model-access-dialog.tsx # Grant access modal
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Model Management                              [+ Add New Model] │
├─────────────────────────────────────────────────────────────────┤
│ Search: [________________]  Filter: [All] [Free] [Premium]     │
├──────────┬─────────┬────────┬──────┬───────┬─────────┬─────────┤
│ Model    │ Provider│ Status │ Tier │ Price │ Usage   │ Actions │
├──────────┼─────────┼────────┼──────┼───────┼─────────┼─────────┤
│ GPT-4o   │ OpenAI  │ ✅ On  │ Free │  -    │ 1.2K/d  │ [Edit]  │
│ Mini     │         │        │      │       │         │ [Stats] │
├──────────┼─────────┼────────┼──────┼───────┼─────────┼─────────┤
│ GPT-4o   │ OpenAI  │ ✅ On  │ Prem │ $2.99 │ 450/d   │ [Edit]  │
│          │         │        │      │       │ 45 users│ [Disable│
│          │         │        │      │       │         │  Stats] │
├──────────┼─────────┼────────┼──────┼───────┼─────────┼─────────┤
│ Claude   │ Anthro  │ ⏸️ Off │ Prem │ $4.99 │ -       │ [Edit]  │
│ Opus     │ -pic    │        │      │       │         │ [Enable]│
└──────────┴─────────┴────────┴──────┴───────┴─────────┴─────────┘
```

**Model Edit Form**:
```
┌─────────────────────────────────────────────────┐
│ Edit Model: GPT-4o                              │
├─────────────────────────────────────────────────┤
│ Display Name*                                    │
│ [GPT-4o                                     ]   │
│                                                  │
│ Description                                      │
│ [OpenAI's most advanced model...            ]   │
│                                                  │
│ Provider*          Provider Model ID*           │
│ [OpenAI ▼]         [gpt-4o                  ]   │
│                                                  │
│ Tier*                                            │
│ ( ) Free  (•) Premium                            │
│                                                  │
│ Price (USD)                                      │
│ [$2.99                                      ]   │
│                                                  │
│ Rate Limiting                                    │
│ [50] messages per day (blank = unlimited)       │
│                                                  │
│ Trial Messages                                   │
│ [2] free messages for non-purchasers            │
│                                                  │
│ Metadata (JSON)                                  │
│ {                                                │
│   "speed": "standard",                           │
│   "quality": "excellent",                        │
│   "contextWindow": 128000,                       │
│   "bestFor": ["Deep analysis", "Complex Q's"]   │
│ }                                                │
│                                                  │
│ Status                                           │
│ [✓] Enabled (visible to users)                  │
│                                                  │
│           [Cancel]  [Save Changes]               │
└─────────────────────────────────────────────────┘
```

**Grant Access Dialog**:
```
┌─────────────────────────────────────────────────┐
│ Grant Model Access                               │
├─────────────────────────────────────────────────┤
│ Model: GPT-4o                                    │
│                                                  │
│ User Email or ID*                                │
│ [user@example.com                           ]   │
│                                                  │
│ Source                                           │
│ (•) Admin Grant                                  │
│ ( ) Trial                                        │
│                                                  │
│ Notes (optional)                                 │
│ [Granted for beta testing...                ]   │
│                                                  │
│           [Cancel]  [Grant Access]               │
└─────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
// app/admin/models/page.tsx
import { ModelTable } from '@/components/admin/model-table';
import { Button } from '@/components/ui/button';
import { createServerClient } from '@/lib/supabase/server-client';

export default async function ModelsPage() {
  const supabase = createServerClient();

  const { data: models } = await supabase
    .from('ai_models')
    .select('*')
    .order('sort_order');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Model Management</h1>
        <Button asChild>
          <Link href="/admin/models/new">+ Add New Model</Link>
        </Button>
      </div>

      <ModelTable models={models} />
    </div>
  );
}
```

```typescript
// components/admin/model-table.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GrantModelAccessDialog } from './grant-model-access-dialog';

export function ModelTable({ models: initialModels }) {
  const [models, setModels] = useState(initialModels);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const queryClient = useQueryClient();

  const toggleEnabled = useMutation({
    mutationFn: async (model: AIModel) => {
      const action = model.enabled ? 'disable' : 'enable';
      const res = await fetch(`/api/admin/models/${model.id}/${action}`, {
        method: 'POST'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    }
  });

  const handleGrantAccess = (model) => {
    setSelectedModel(model);
    setGrantDialogOpen(true);
  };

  return (
    <>
      <table className="w-full">
        <thead>
          <tr>
            <th>Model</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Tier</th>
            <th>Price</th>
            <th>Usage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id}>
              <td>{model.display_name}</td>
              <td>{model.provider}</td>
              <td>
                <Badge variant={model.enabled ? 'default' : 'secondary'}>
                  {model.enabled ? '✅ Enabled' : '⏸️ Disabled'}
                </Badge>
              </td>
              <td>
                <Badge variant={model.tier === 'premium' ? 'default' : 'outline'}>
                  {model.tier}
                </Badge>
              </td>
              <td>
                {model.price_cents
                  ? `$${(model.price_cents / 100).toFixed(2)}`
                  : '-'}
              </td>
              <td>
                {/* Usage stats - to be implemented */}
                -
              </td>
              <td className="space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/models/${model.id}`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleEnabled.mutate(model)}
                >
                  {model.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGrantAccess(model)}
                >
                  Grant
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <GrantModelAccessDialog
        model={selectedModel}
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
      />
    </>
  );
}
```

---

### Phase 5: Testing, Analytics & Documentation ⏸️ Not Started

**Deliverables**:
- Unit tests for model selection logic
- Integration tests for API endpoints
- E2E tests for user model selection flow
- E2E tests for admin model management
- Analytics events for model usage and purchases
- User documentation
- Admin documentation

**Testing Coverage**:

```typescript
// __tests__/lib/model-selection.test.ts
describe('Model Selection Logic', () => {
  it('should select user default model', async () => {
    const result = await selectModelForRequest({
      userId: 'user-123',
      personaId: 'marcus'
    });
    expect(result.modelId).toBe('gpt-4o-mini');
  });

  it('should respect per-persona override', async () => {
    // User has Marcus set to Claude Sonnet
    const result = await selectModelForRequest({
      userId: 'user-with-override',
      personaId: 'marcus'
    });
    expect(result.modelId).toBe('claude-3-5-sonnet');
  });

  it('should use trial message for locked premium model', async () => {
    const result = await selectModelForRequest({
      userId: 'free-user',
      personaId: 'marcus',
      preferredModelId: 'gpt-4o' // Premium, has 2 trial messages
    });
    expect(result.isTrialMessage).toBe(true);
  });

  it('should throw MODEL_LOCKED error when trial exhausted', async () => {
    await expect(
      selectModelForRequest({
        userId: 'user-no-trials',
        personaId: 'marcus',
        preferredModelId: 'gpt-4o'
      })
    ).rejects.toThrow('MODEL_LOCKED');
  });

  it('should enforce rate limits for premium models', async () => {
    // User has reached daily limit
    await expect(
      selectModelForRequest({
        userId: 'heavy-user',
        personaId: 'marcus',
        preferredModelId: 'gpt-4o'
      })
    ).rejects.toThrow('RATE_LIMIT_EXCEEDED');
  });
});
```

```typescript
// e2e/specs/model-selection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Model Selection Feature', () => {
  test('user can change default model', async ({ page }) => {
    await page.goto('/settings/ai-models');

    // Change default model
    await page.click('[data-testid="default-model-dropdown"]');
    await page.click('text=Claude 3.5 Haiku (Free)');

    // Verify saved
    await expect(page.locator('[data-testid="default-model-dropdown"]'))
      .toContainText('Claude 3.5 Haiku');

    // Verify used in coach
    await page.goto('/marcus');
    await page.fill('[data-testid="message-input"]', 'Hello');
    await page.click('[data-testid="send-button"]');

    // Check response metadata contains correct model
    const response = await page.waitForSelector('[data-testid="assistant-message"]');
    const modelUsed = await response.getAttribute('data-model-id');
    expect(modelUsed).toBe('claude-3-5-haiku');
  });

  test('user can purchase premium model', async ({ page }) => {
    await page.goto('/settings/ai-models');

    // Click unlock on GPT-4o
    await page.click('text=GPT-4o >> .. >> text=Unlock $2.99');

    // Should redirect to Stripe
    await page.waitForURL(/checkout.stripe.com/);
  });

  test('user can use trial messages', async ({ page }) => {
    await page.goto('/marcus');

    // Open model selector in chat
    await page.click('[data-testid="model-selector"]');
    await page.click('text=GPT-4o (2 trial messages left)');

    // Send message
    await page.fill('[data-testid="message-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');

    // Should see trial indicator
    await expect(page.locator('text=Trial message')).toBeVisible();
    await expect(page.locator('text=1 trial message remaining')).toBeVisible();
  });

  test('admin can create new model', async ({ page }) => {
    await page.goto('/admin/models');
    await page.click('text=Add New Model');

    // Fill form
    await page.fill('[name="id"]', 'test-model');
    await page.fill('[name="displayName"]', 'Test Model');
    await page.selectOption('[name="provider"]', 'openai');
    await page.fill('[name="providerModelId"]', 'gpt-test');
    await page.check('[name="tier"][value="premium"]');
    await page.fill('[name="priceCents"]', '399');

    await page.click('text=Create Model');

    // Verify in list
    await expect(page.locator('text=Test Model')).toBeVisible();
  });
});
```

**Analytics Events**:

```typescript
// Model selection events
capture('model_selected', {
  modelId: string,
  personaId: string,
  isDefault: boolean,
  isOverride: boolean
});

capture('model_preference_saved', {
  defaultModelId: string,
  hasOverrides: boolean,
  overrideCount: number
});

// Purchase events
capture('model_purchase_initiated', {
  modelId: string,
  priceCents: number
});

capture('model_purchase_completed', {
  modelId: string,
  priceCents: number,
  source: 'inline' | 'settings'
});

// Trial events
capture('model_trial_started', {
  modelId: string,
  trialMessagesRemaining: number
});

capture('model_trial_message_used', {
  modelId: string,
  trialMessagesRemaining: number
});

capture('model_trial_expired_prompt', {
  modelId: string,
  priceCents: number
});

// Usage events
capture('model_rate_limit_hit', {
  modelId: string,
  dailyLimit: number,
  resetAt: string
});

capture('model_message_sent', {
  modelId: string,
  personaId: string,
  isTrialMessage: boolean,
  messageLength: number
});

// Admin events
capture('admin_model_created', {
  modelId: string,
  tier: string,
  priceCents: number
});

capture('admin_model_enabled', { modelId: string });
capture('admin_model_disabled', { modelId: string });

capture('admin_model_access_granted', {
  modelId: string,
  userId: string,
  source: string
});
```

**User Documentation**:
- Create `docs/user-guides/choosing-ai-models.md`
- Include in help center
- Add tooltips in UI

**Admin Documentation**:
- Create `docs/admin/model-management.md`
- Include pricing guidelines
- Rate limiting best practices

---

## Success Metrics

### Launch Criteria
- [ ] All phases complete and tested
- [ ] Unit tests passing (>80% coverage on model selection logic)
- [ ] Integration tests passing for all API endpoints
- [ ] E2E tests covering user and admin flows
- [ ] Security audit complete (entitlement enforcement, rate limiting)
- [ ] Performance benchmarks met (<200ms for model selection logic)
- [ ] Documentation complete (user guides, admin docs)
- [ ] Analytics events firing correctly

### Post-Launch KPIs

**User Adoption**:
- % of users who change default model (target: 30% within 30 days)
- % of users who set per-persona overrides (target: 10%)
- Model preference distribution across user base

**Revenue**:
- Premium model purchase conversion rate (target: 5-10% of active users)
- Average revenue per user from model purchases
- Trial-to-purchase conversion rate (target: 20%)

**Engagement**:
- Messages per day per premium model
- Rate limit hit rate (should be <5% to avoid user frustration)
- Model switching frequency

**Technical**:
- Model selection latency (target: <50ms p95)
- Rate limiting accuracy (should reset daily as expected)
- Entitlement check failures (should be near 0%)

### Success Thresholds

**6 Weeks Post-Launch**:
- At least 25% of users have explored model settings
- At least $500 MRR from model purchases
- <0.1% error rate on model selection
- Trial feature drives 15%+ of premium model purchases

---

## Risk Mitigation

### Technical Risks

**Risk 1: Model Provider Outages**
- **Impact**: Users can't use selected model
- **Mitigation**: Automatic fallback to system default (GPT-4o-mini)
- **Detection**: Provider health checks + error monitoring

**Risk 2: Rate Limiting Bugs**
- **Impact**: Users hit limits incorrectly or limits don't reset
- **Mitigation**: Extensive testing + daily reset cron job monitoring
- **Detection**: Analytics on rate_limit_hit events + user reports

**Risk 3: Entitlement Bypass**
- **Impact**: Users access premium models without payment
- **Mitigation**: Server-side entitlement checks on every request
- **Detection**: Audit logs + Stripe reconciliation

### Business Risks

**Risk 1: Low Conversion**
- **Impact**: Revenue targets not met
- **Mitigation**: 2 free trial messages + clear value prop
- **Detection**: Track trial-to-purchase funnel

**Risk 2: User Confusion**
- **Impact**: Support burden increases, user frustration
- **Mitigation**: Clear UI, tooltips, help docs
- **Detection**: Support ticket volume, analytics on help views

### Rollback Plan

If critical issues arise:
1. **Disable feature flag** (if using gradual rollout)
2. **Revert to system defaults** for all users
3. **Pause new purchases** via admin toggle
4. **Investigate and fix** issue
5. **Re-enable** with monitoring

---

## Future Enhancements

### Post-MVP Improvements

**Phase 6: Advanced Features** (Future)
- **Model Performance Analytics**: Show users stats on response quality, speed
- **Smart Model Recommendations**: Suggest best model for user's question type
- **Hybrid Model Routing**: Auto-select model based on question complexity
- **Model Bundles**: "All Premium Models" package at discount
- **Subscription Tier**: Monthly/yearly access to all premium models
- **Usage Analytics**: Show users their model usage patterns
- **Model Playground**: Try different models side-by-side on same question

**Phase 7: Enterprise Features** (Future)
- **Custom Models**: Upload/integrate custom fine-tuned models
- **Team Model Policies**: Org admins can restrict/allow models
- **Budget Controls**: Set spending limits per user or team
- **Audit Logs**: Complete model usage history for compliance

---

## Dependencies & Prerequisites

### Must Be Complete Before Starting
- ✅ Freemium monetization system (products, purchases, entitlements)
- ✅ Stripe integration and webhook handling
- ✅ AI orchestrator and provider registry
- ✅ User settings page infrastructure

### External Service Dependencies
- Stripe API (for payments)
- OpenAI API (for GPT models)
- Anthropic API (for Claude models)
- Together AI (for open-source models)
- Google AI (for Gemini models - optional)

### Team Coordination Needs
- **Backend**: Database schema, API endpoints, rate limiting
- **Frontend**: Settings UI, model selection components
- **Admin**: Admin dashboard for model management
- **QA**: Comprehensive testing across all flows
- **Product**: Pricing strategy, trial message limits
- **Support**: User documentation, help center content

---

**This feature represents a significant monetization opportunity while giving users more control over their experience. The trial message system reduces friction and encourages conversion, while the admin controls provide flexibility to adjust pricing and limits based on real-world usage patterns.**
