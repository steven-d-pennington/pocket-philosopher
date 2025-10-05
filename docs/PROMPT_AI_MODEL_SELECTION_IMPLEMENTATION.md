# Implementation Prompt: AI Model Selection Feature

**Task**: Implement the AI Model Selection feature for Pocket Philosopher

---

## Quick Context

You're working on **Pocket Philosopher**, a Next.js 15 philosophical coaching app with:
- **Tech Stack**: Next.js 15 (App Router), TypeScript, Supabase (PostgreSQL), Stripe, TanStack Query, Zustand
- **Current Features**: AI coaches (6 personas), freemium monetization (coach purchases), admin dashboard
- **Your Task**: Add user-selectable AI models (free + premium) with trial messages and rate limiting

---

## What to Build

Users can choose which AI model powers their coaches:
- **Free models**: GPT-4o Mini, Claude Haiku, Llama 3.1
- **Premium models**: GPT-4o ($2.99), Claude Sonnet ($2.99), Claude Opus ($4.99), Gemini Pro ($2.99)
- **Global default model** stored in user profile
- **2 free trial messages** per premium model before purchase
- **Rate limiting**: Configurable per model (e.g., 50 messages/day)
- **Admin controls**: Full model catalog management

---

## Implementation Instructions

### Step 1: Read the Documentation

**Required Reading** (in order):
1. `docs/build-plan/ai-model-selection-feature.md` - Complete feature specification
2. `docs/build-plan/tasks/ai-model-selection/tasks.md` - Phased task breakdown

**Reference Documents**:
- `docs/DOCUMENTATION_METHODOLOGY.md` - Project documentation standards
- `docs/AGENTS.md` - Codebase architecture and patterns
- `docs/build-plan/freemium-monetization-feature.md` - Existing monetization system (you'll extend this)

### Step 2: Follow the Phases Sequentially

Implement in this order (see task breakdown for details):

**Phase 1: Database Schema** (3-4 days)
- Create `ai_models` table
- Create `model_usage` table
- Add columns to `profiles` table
- Seed initial models (7-8 models)
- Add Stripe products for premium models

**Phase 2: Backend API** (5-7 days)
- User endpoints: `/api/models`, `/api/profile/model-preferences`, trial/usage endpoints
- Admin endpoints: `/api/admin/models` CRUD
- Model selection logic in `lib/ai/model-selection.ts`
- Rate limiting service in `lib/ai/rate-limiting.ts`
- Update AI orchestrator to use selected model
- Update purchase webhook for model entitlements

**Phase 3: User Settings UI** (4-5 days)
- Create `/settings/ai-models` page
- Build model selector components
- Premium model cards with purchase buttons
- Trial message indicators

**Phase 4: Admin UI** (4-5 days)
- Create `/admin/models` pages (list, create, edit)
- Model management table
- Grant access dialog
- Usage stats dashboard

**Phase 5: Testing** (3-4 days)
- Unit tests (model selection, rate limiting)
- Integration tests (all APIs)
- E2E tests (user + admin flows)
- Analytics events

**Phase 6: Deployment** (2-3 days)
- Run migrations staging + production
- Create Stripe products
- Monitor and verify

---

## Key Technical Details

### Database Tables to Create

```sql
-- See full schema in feature spec, key tables:
ai_models (id, provider, display_name, tier, price_cents, rate_limit_messages_per_day, trial_messages_allowed, enabled, metadata, ...)
model_usage (user_id, model_id, message_count, trial_messages_used, last_reset_at)
-- Add to profiles: default_model_id, persona_model_overrides (JSONB)
```

### API Endpoints to Create

**User-facing** (4 main endpoints):
- `GET /api/models` - List models with entitlements
- `PATCH /api/profile/model-preferences` - Save user preferences
- `GET /api/models/:modelId/trial-status` - Trial info
- `GET /api/models/:modelId/usage` - Usage stats

**Admin** (6 endpoints):
- `GET/POST /api/admin/models` - List/create models
- `PATCH /api/admin/models/:id` - Update model
- `POST /api/admin/models/:id/enable|disable` - Toggle
- `POST /api/admin/entitlements/grant-model` - Grant access

### Core Business Logic

Create `lib/ai/model-selection.ts`:
```typescript
async function selectModelForRequest(options: {
  userId: string;
  personaId: string;
}): Promise<{ modelId: string; isTrialMessage: boolean }> {
  // 1. Get user preference (persona override OR default OR 'gpt-4o-mini')
  // 2. Check if premium model - verify entitlement
  // 3. If no entitlement, check trial messages (allow 2 free)
  // 4. Check rate limits (daily message cap)
  // 5. Increment usage counters
  // 6. Return selected model
}
```

### Integration Points

**AI Orchestrator** (`lib/ai/orchestrator.ts`):
```typescript
// Update chat() function to:
const { modelId } = await selectModelForRequest({ userId, personaId });
const model = await getModel(modelId);
const provider = await getProviderForModel(model);
// Then use model.provider_model_id when calling provider.stream()
```

**Purchase Webhook** (`app/api/purchases/webhook/route.ts`):
```typescript
// Add handling for model purchases:
if (purchase.product.type === 'model') {
  await grantModelEntitlement(userId, productId);
}
```

---

## Important Patterns to Follow

### 1. Reuse Existing Systems
- **Entitlements**: Use existing `products`, `purchases`, `entitlements` tables (add `type: 'model'`)
- **Stripe**: Use existing checkout flow (just add model products)
- **RLS**: Follow same Row-Level Security patterns as other tables

### 2. File Naming Conventions
- Routes: `app/api/models/route.ts`, `app/admin/models/page.tsx`
- Components: `components/settings/model-*.tsx`, `components/admin/model-*.tsx`
- Business logic: `lib/ai/model-selection.ts`, `lib/ai/rate-limiting.ts`
- Types: Add to `lib/types/models.ts` or `lib/supabase/types.ts`

### 3. Error Handling
```typescript
// Throw specific errors for different scenarios:
throw new Error('MODEL_LOCKED'); // Premium model without entitlement
throw new Error('TRIAL_EXPIRED'); // No trial messages left
throw new Error('RATE_LIMIT_EXCEEDED'); // Daily limit hit
```

### 4. Analytics Events
Add 13 events (see Phase 5 in tasks.md):
- Model selected, preferences saved
- Purchase initiated/completed
- Trial started/used/expired
- Rate limit hit
- Admin actions

---

## Testing Checklist

Before marking phases complete:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests cover user + admin flows
- [ ] Trial messages work (2 free, then locked)
- [ ] Rate limits enforce correctly and reset daily
- [ ] Premium models require purchase or trial
- [ ] Admin can manage catalog
- [ ] Analytics events fire
- [ ] No security vulnerabilities (entitlement bypass, rate limit bypass)

---

## Success Criteria

**You're done when**:
1. ✅ All 6 phases complete per task breakdown
2. ✅ Users can select models in settings
3. ✅ Premium models show trial messages (2 free)
4. ✅ Purchase flow works (Stripe checkout)
5. ✅ Rate limiting enforces daily caps
6. ✅ Admin can create/edit/enable/disable models
7. ✅ All tests passing
8. ✅ Documentation updated with any implementation notes

---

## Questions or Issues?

**Refer to**:
- Full spec: `docs/build-plan/ai-model-selection-feature.md`
- Task details: `docs/build-plan/tasks/ai-model-selection/tasks.md`
- Codebase guide: `docs/AGENTS.md`
- Existing code patterns: Look at freemium monetization implementation

**Don't hesitate to**:
- Ask clarifying questions if spec is unclear
- Suggest improvements to the design
- Flag potential issues early

---

## Quick Start Command

```bash
# 1. Read the docs
cat docs/build-plan/ai-model-selection-feature.md
cat docs/build-plan/tasks/ai-model-selection/tasks.md

# 2. Start with Phase 1 - create database migration
# File: database/migrations/YYYYMMDDHHMMSS_add_ai_model_selection.sql
```

**Estimated Timeline**: 4-6 weeks (can parallelize Phase 3 & 4)

Good luck! 🚀
