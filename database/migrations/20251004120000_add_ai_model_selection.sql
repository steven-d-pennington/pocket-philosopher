-- Migration: Add AI Model Selection Feature
-- Created: October 4, 2025
-- Description: Adds ai_models table, model_usage table, and columns to profiles for AI model selection

-- Create ai_models table
CREATE TABLE ai_models (
  id VARCHAR(50) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  provider_model_id VARCHAR(100) NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  tier VARCHAR(20) NOT NULL,
  price_cents INT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  metadata JSONB,
  rate_limit_messages_per_day INT,
  trial_messages_allowed INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add model preference columns to profiles table
ALTER TABLE profiles
  ADD COLUMN default_model_id VARCHAR(50),
  ADD COLUMN persona_model_overrides JSONB;

-- Create model_usage table for rate limiting and trial tracking
CREATE TABLE model_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  model_id VARCHAR(50),
  message_count INT DEFAULT 1,
  trial_messages_used INT DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id)
);

-- Add foreign key constraints
-- Temporarily disabled for testing
-- ALTER TABLE profiles
--   ADD CONSTRAINT fk_profiles_default_model_id
--   FOREIGN KEY (default_model_id) REFERENCES ai_models(id);

-- ALTER TABLE model_usage
--   ADD CONSTRAINT fk_model_usage_user_id
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ALTER TABLE model_usage
--   ADD CONSTRAINT fk_model_usage_model_id
--   FOREIGN KEY (model_id) REFERENCES ai_models(id);

-- Row-Level Security policies
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

-- Trigger for updated_at timestamps
CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed initial model catalog

-- Free Models
INSERT INTO ai_models (id, provider, provider_model_id, display_name, description, enabled, tier, metadata, rate_limit_messages_per_day, sort_order) VALUES
('gpt-4o-mini', 'openai', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast, efficient model ideal for most conversations. Good balance of speed and quality.', true, 'free', '{"speed": "fast", "quality": "good", "contextWindow": 128000, "costPer1MTok": 0.15, "bestFor": ["Quick responses", "Daily coaching", "General advice"]}', NULL, 1),
('claude-3-5-haiku', 'anthropic', 'claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'Anthropic''s fastest model with strong reasoning capabilities.', true, 'free', '{"speed": "fastest", "quality": "good", "contextWindow": 200000, "costPer1MTok": 0.25, "bestFor": ["Speed", "Analysis", "Quick insights"]}', NULL, 2),
('llama-3.1-8b', 'together', 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'Llama 3.1 8B', 'Open-source model running on Together AI. Fast and capable.', true, 'free', '{"speed": "fast", "quality": "good", "contextWindow": 131072, "costPer1MTok": 0.18, "bestFor": ["Open source", "Privacy-conscious", "Experimentation"]}', NULL, 3);

-- Premium Models (Stripe IDs to be filled after Stripe product creation)
INSERT INTO ai_models (id, provider, provider_model_id, display_name, description, enabled, tier, price_cents, metadata, rate_limit_messages_per_day, trial_messages_allowed, sort_order) VALUES
('gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', 'OpenAI''s most advanced multimodal model. Exceptional reasoning and philosophical depth.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 128000, "costPer1MTok": 2.50, "bestFor": ["Deep analysis", "Complex questions", "Nuanced reasoning"]}', 50, 2, 10),
('claude-3-5-sonnet', 'anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Anthropic''s flagship model. Outstanding at philosophical discussion and ethical reasoning.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 200000, "costPer1MTok": 3.00, "bestFor": ["Philosophical depth", "Ethical reasoning", "Long-form responses"]}', 50, 2, 11),
('claude-3-opus', 'anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Anthropic''s most intelligent model. Unmatched for deep philosophical exploration.', true, 'premium', 499, '{"speed": "slower", "quality": "exceptional", "contextWindow": 200000, "costPer1MTok": 15.00, "bestFor": ["Maximum depth", "Complex philosophy", "Extended dialogues"]}', 30, 2, 12),
('gemini-pro-1.5', 'google', 'gemini-1.5-pro-latest', 'Gemini 1.5 Pro', 'Google''s advanced model with massive context window. Great for long conversations.', true, 'premium', 299, '{"speed": "standard", "quality": "excellent", "contextWindow": 2000000, "costPer1MTok": 1.25, "bestFor": ["Long context", "Multi-turn dialogue", "Reference-heavy discussions"]}', 50, 2, 13);

-- Add model SKUs to products table (Stripe IDs to be filled after creation)
INSERT INTO products (id, stripe_product_id, stripe_price_id, name, description, price_cents, type, metadata, active) VALUES
(uuid_generate_v4(), 'prod_MODEL_GPT4O', 'price_MODEL_GPT4O', 'GPT-4o Model Access', 'Unlock OpenAI''s GPT-4o model for all your coaches', 299, 'model', '{"model_id": "gpt-4o"}', true),
(uuid_generate_v4(), 'prod_MODEL_CLAUDE_SONNET', 'price_MODEL_CLAUDE_SONNET', 'Claude 3.5 Sonnet Model Access', 'Unlock Anthropic''s Claude 3.5 Sonnet model', 299, 'model', '{"model_id": "claude-3-5-sonnet"}', true),
(uuid_generate_v4(), 'prod_MODEL_CLAUDE_OPUS', 'price_MODEL_CLAUDE_OPUS', 'Claude 3 Opus Model Access', 'Unlock Anthropic''s most powerful Claude 3 Opus model', 499, 'model', '{"model_id": "claude-3-opus"}', true),
(uuid_generate_v4(), 'prod_MODEL_GEMINI', 'price_MODEL_GEMINI', 'Gemini 1.5 Pro Model Access', 'Unlock Google''s Gemini 1.5 Pro with massive context', 299, 'model', '{"model_id": "gemini-pro-1.5"}', true);