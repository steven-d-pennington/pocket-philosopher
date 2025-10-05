# AI Model Selection Tasks

**Feature**: AI Model Selection
**Created**: October 4, 2025
**Owner**: TBD
**Priority**: High

---

## Phase 1: Database Schema & Model Catalog ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 3-4 days
**Dependencies**: Existing entitlements system, Stripe integration

### Deliverables

- [ ] 1.1: Create `ai_models` table with complete schema
- [ ] 1.2: Add model preference columns to `profiles` table
- [ ] 1.3: Create `model_usage` table for rate limiting and trial tracking
- [ ] 1.4: Create database migration file
- [ ] 1.5: Seed initial model catalog with 7-8 models (3 free, 4-5 premium)
- [ ] 1.6: Add model SKUs to `products` table for Stripe integration [P]
- [ ] 1.7: Create Stripe products and prices for premium models [P]
- [ ] 1.8: Test database constraints and RLS policies [P]

### Implementation Details

**File Locations**:
- Migration: `database/migrations/YYYYMMDDHHMMSS_add_ai_model_selection.sql`
- Seed data: Include in migration or create `database/seeds/ai_models.sql`
- Types: `lib/supabase/types.ts` (update with new table types)

**Database Schema** (see feature spec for complete SQL):
```sql
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

ALTER TABLE profiles
  ADD COLUMN default_model_id VARCHAR(50) REFERENCES ai_models(id),
  ADD COLUMN persona_model_overrides JSONB;

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
```

**Initial Models to Seed**:

Free Models:
1. `gpt-4o-mini` - OpenAI GPT-4o Mini (system default)
2. `claude-3-5-haiku` - Anthropic Claude 3.5 Haiku
3. `llama-3.1-8b` - Meta Llama 3.1 8B via Together AI

Premium Models:
4. `gpt-4o` - OpenAI GPT-4o ($2.99, 50 msgs/day, 2 trial msgs)
5. `claude-3-5-sonnet` - Anthropic Claude 3.5 Sonnet ($2.99, 50 msgs/day, 2 trial msgs)
6. `claude-3-opus` - Anthropic Claude 3 Opus ($4.99, 30 msgs/day, 2 trial msgs)
7. `gemini-pro-1.5` - Google Gemini 1.5 Pro ($2.99, 50 msgs/day, 2 trial msgs)

**Stripe Product Creation**:
- Use Stripe Dashboard or API to create products
- Save `stripe_product_id` and `stripe_price_id` to `ai_models` table
- Also add to `products` table with `type: 'model'` for entitlement system

### Acceptance Criteria

- [ ] Migration runs successfully on clean database
- [ ] All tables created with correct schema
- [ ] RLS policies prevent unauthorized access
- [ ] Seed data populates 7-8 models correctly
- [ ] Stripe products created and IDs saved
- [ ] Can query models table and get expected data
- [ ] Foreign key constraints work (can't set invalid default_model_id)
- [ ] No TypeScript errors after updating types

---

## Phase 2: Backend API & Business Logic ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 5-7 days
**Dependencies**: Phase 1 complete

### Deliverables

- [ ] 2.1: Create `/api/models` endpoint (GET available models with user entitlements)
- [ ] 2.2: Create `/api/profile/model-preferences` endpoint (PATCH user preferences)
- [ ] 2.3: Create `/api/models/:modelId/trial-status` endpoint (GET trial info)
- [ ] 2.4: Create `/api/models/:modelId/usage` endpoint (GET usage stats)
- [ ] 2.5: Implement model selection logic in `lib/ai/model-selection.ts`
- [ ] 2.6: Integrate model selection into AI orchestrator (`lib/ai/orchestrator.ts`)
- [ ] 2.7: Create rate limiting service (`lib/ai/rate-limiting.ts`)
- [ ] 2.8: Create trial message tracking service [P]
- [ ] 2.9: Update purchase webhook to grant model entitlements [P]
- [ ] 2.10: Create admin API endpoints (6 endpoints) [P]
- [ ] 2.11: Add cron job or background task for daily rate limit reset [P]

### Implementation Details

**File Locations**:
- User APIs: `app/api/models/route.ts`, `app/api/models/[modelId]/*/route.ts`
- Profile API: `app/api/profile/model-preferences/route.ts`
- Admin APIs: `app/api/admin/models/**/*.ts`
- Business logic: `lib/ai/model-selection.ts`, `lib/ai/rate-limiting.ts`
- Orchestrator update: `lib/ai/orchestrator.ts`
- Webhook update: `app/api/purchases/webhook/route.ts`

**Key Functions to Implement**:

```typescript
// lib/ai/model-selection.ts
async function selectModelForRequest(options: {
  userId: string;
  personaId: string;
  messageContent?: string;
}): Promise<{
  modelId: string;
  isTrialMessage: boolean;
  usageInfo: ModelUsageInfo;
}>;

async function checkModelEntitlement(userId: string, modelId: string): Promise<boolean>;

async function getModelUsage(userId: string, modelId: string): Promise<ModelUsageInfo>;

async function incrementModelUsage(userId: string, modelId: string): Promise<void>;

async function incrementTrialUsage(userId: string, modelId: string): Promise<void>;

// lib/ai/rate-limiting.ts
async function checkRateLimit(userId: string, modelId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}>;

async function resetDailyLimits(): Promise<void>; // Cron job

// lib/ai/orchestrator.ts (update existing)
async function* chat(
  message: string,
  personaId: string,
  userId: string,
  conversationId?: string
): AsyncGenerator<ChatChunk> {
  // NEW: Select model based on user preferences
  const { modelId, isTrialMessage } = await selectModelForRequest({
    userId,
    personaId,
    messageContent: message
  });

  // Get model and route to correct provider
  const model = await getModel(modelId);
  const provider = await getProviderForModel(model);

  // ... rest of existing logic
}
```

**API Endpoint Implementations**:

```typescript
// app/api/models/route.ts
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  // Get all enabled models
  const models = await supabase
    .from('ai_models')
    .select('*')
    .eq('enabled', true)
    .order('tier, sort_order');

  // Check entitlements for premium models
  const entitlements = await getUserEntitlements(session.user.id);
  const usage = await getUserModelUsage(session.user.id);

  // Get user preferences
  const profile = await getProfile(session.user.id);

  return NextResponse.json({
    data: {
      free: models.filter(m => m.tier === 'free'),
      premium: models
        .filter(m => m.tier === 'premium')
        .map(m => ({
          ...m,
          purchased: entitlements.some(e => e.model_id === m.id),
          usageToday: usage[m.id] || { used: 0, limit: m.rate_limit_messages_per_day },
          trialMessagesRemaining: m.trial_messages_allowed - (usage[m.id]?.trial_used || 0)
        })),
      userPreferences: {
        defaultModelId: profile.default_model_id,
        personaOverrides: profile.persona_model_overrides || {}
      }
    }
  });
}
```

```typescript
// app/api/profile/model-preferences/route.ts
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await request.json();
  const { defaultModelId, personaOverrides } = body;

  // Validate model IDs exist and user has access
  if (defaultModelId) {
    const model = await getModel(defaultModelId);
    if (!model?.enabled) return badRequest('Invalid model');
    if (model.tier === 'premium') {
      const hasAccess = await checkModelEntitlement(session.user.id, defaultModelId);
      if (!hasAccess) return forbidden('Model not unlocked');
    }
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      default_model_id: defaultModelId,
      persona_model_overrides: personaOverrides
    })
    .eq('id', session.user.id);

  return NextResponse.json({ success: true });
}
```

**Admin API Examples**:

```typescript
// app/api/admin/models/route.ts
export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminAuth(request);
  if (!isAdmin) return forbidden();

  const models = await supabase.from('ai_models').select('*').order('sort_order');
  return NextResponse.json({ data: models.data });
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAuth(request);
  if (!isAdmin) return forbidden();

  const body = await request.json();
  // Validate and create model
  const { data, error } = await supabase
    .from('ai_models')
    .insert(body)
    .select()
    .single();

  if (error) return serverError(error);
  return NextResponse.json({ data }, { status: 201 });
}
```

**Webhook Update**:

```typescript
// app/api/purchases/webhook/route.ts
// Add to existing webhook handler

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const purchase = await getPurchaseBySessionId(session.id);

  if (purchase.product.type === 'model') {
    // Grant model entitlement
    await supabase.from('entitlements').insert({
      user_id: purchase.user_id,
      product_id: purchase.product_id,
      source: 'purchase',
      granted_at: new Date().toISOString()
    });

    // Emit analytics event
    serverAnalytics.capture({
      event: 'model_purchase_completed',
      distinctId: purchase.user_id,
      properties: {
        modelId: purchase.product.metadata.model_id,
        priceCents: purchase.amount_cents
      }
    });
  }
}
```

### Acceptance Criteria

- [ ] All user API endpoints return correct data
- [ ] Model selection logic correctly chooses user's preferred model
- [ ] Entitlement checks prevent access to locked premium models
- [ ] Trial messages work (2 free messages, then locked)
- [ ] Rate limiting enforces daily limits correctly
- [ ] Rate limits reset daily (cron job working)
- [ ] Admin can create/edit/enable/disable models
- [ ] Admin can grant model access to users
- [ ] Purchase webhook grants model entitlements
- [ ] All endpoints have proper error handling
- [ ] No unauthorized access to premium features
- [ ] Analytics events fire correctly

---

## Phase 3: User Settings UI ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 4-5 days
**Dependencies**: Phase 2 complete

### Deliverables

- [ ] 3.1: Create `/settings/ai-models` route page
- [ ] 3.2: Build `ModelSelector` main component
- [ ] 3.3: Build `ModelDropdown` component for model selection
- [ ] 3.4: Build `ModelCard` component for premium models with purchase buttons
- [ ] 3.5: Build `ModelMetadataBadge` component for speed/quality/context indicators
- [ ] 3.6: Build `PersonaOverrideList` component for per-persona settings [P]
- [ ] 3.7: Build `TrialMessageIndicator` component [P]
- [ ] 3.8: Add model selection to coach page (optional inline selector) [P]
- [ ] 3.9: Integrate with existing Stripe checkout flow
- [ ] 3.10: Add loading states, error handling, and success toasts
- [ ] 3.11: Make UI responsive for mobile

### Implementation Details

**File Locations**:
- Route: `app/(dashboard)/settings/ai-models/page.tsx`
- Components: `components/settings/model-*.tsx` (7 components)
- Hooks: `lib/hooks/use-models.ts` (custom hook for model data/mutations)
- Types: `lib/types/models.ts` (TypeScript interfaces)

**Component Structure**:

```
app/(dashboard)/settings/ai-models/page.tsx
└── components/settings/
    ├── model-selector.tsx           # Main container
    ├── model-dropdown.tsx           # Dropdown for selecting model
    ├── model-card.tsx               # Premium model card
    ├── model-metadata-badge.tsx     # Speed/quality badges
    ├── persona-override-list.tsx    # Per-persona overrides
    ├── trial-message-indicator.tsx  # Trial usage display
    └── model-comparison-modal.tsx   # (optional) Compare models side-by-side
```

**Custom Hook**:

```typescript
// lib/hooks/use-models.ts
export function useModels() {
  const { data, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/models');
      return res.json();
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (prefs) => {
      const res = await fetch('/api/profile/model-preferences', {
        method: 'PATCH',
        body: JSON.stringify(prefs)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success('Model preferences updated');
    }
  });

  return {
    freeModels: data?.data?.free || [],
    premiumModels: data?.data?.premium || [],
    userPreferences: data?.data?.userPreferences || {},
    isLoading,
    updatePreferences: updatePreferences.mutate
  };
}
```

**UI States to Handle**:
- Loading state (skeleton loaders)
- Empty state (no models available)
- Error state (failed to load models)
- Success state (preferences saved)
- Trial exhausted state (show upgrade prompt)
- Rate limit hit state (show reset time)
- Locked premium model state (show purchase button)

**Responsive Design**:
- Desktop: 2-column layout (settings + model cards)
- Tablet: Single column, collapsible sections
- Mobile: Stack all elements, full-width cards

### Acceptance Criteria

- [ ] User can view all available models (free + premium)
- [ ] User can change default model and see it save
- [ ] User can set per-persona overrides (collapsible section)
- [ ] Premium models show pricing and purchase button
- [ ] Locked premium models show trial message counter
- [ ] Purchased models show "Unlocked" badge
- [ ] Models with rate limits show usage stats (X/Y messages today)
- [ ] Clicking "Unlock" redirects to Stripe checkout
- [ ] Trial messages counter is accurate
- [ ] Mobile UI is fully functional and looks good
- [ ] Loading states show during data fetches
- [ ] Error messages display clearly
- [ ] Success toasts appear after saving preferences
- [ ] Model metadata (speed, quality, context) displays correctly

---

## Phase 4: Admin Model Management UI ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 4-5 days
**Dependencies**: Phase 2 complete

### Deliverables

- [ ] 4.1: Create `/admin/models` route page (model list/table)
- [ ] 4.2: Create `/admin/models/new` route page (create model form)
- [ ] 4.3: Create `/admin/models/[modelId]` route page (edit model form)
- [ ] 4.4: Build `ModelTable` component with enable/disable toggles
- [ ] 4.5: Build `ModelForm` component for create/edit
- [ ] 4.6: Build `ModelUsageStats` component (usage analytics dashboard) [P]
- [ ] 4.7: Build `GrantModelAccessDialog` component for granting access to users
- [ ] 4.8: Add search and filter functionality to model table [P]
- [ ] 4.9: Add bulk actions (enable/disable multiple models) [P]
- [ ] 4.10: Add export functionality (CSV of model usage stats) [P]

### Implementation Details

**File Locations**:
- Routes: `app/admin/models/**/*.tsx`
- Components: `components/admin/model-*.tsx`
- API calls: Use existing admin API endpoints from Phase 2

**Component Structure**:

```
app/admin/models/
├── page.tsx                  # Model list/table
├── new/
│   └── page.tsx              # Create model form
└── [modelId]/
    └── page.tsx              # Edit model form

components/admin/
├── model-table.tsx           # Model list with actions
├── model-form.tsx            # Create/edit form
├── model-usage-stats.tsx     # Usage analytics
├── grant-model-access-dialog.tsx # Grant access modal
└── model-bulk-actions.tsx    # Bulk enable/disable
```

**Model Table Features**:
- Sortable columns (name, provider, status, tier, usage)
- Filter by tier (free/premium), status (enabled/disabled), provider
- Search by model name
- Inline enable/disable toggle
- Quick actions: Edit, Stats, Grant Access
- Pagination for large model catalogs

**Model Form Fields**:
- ID (readonly on edit, required on create)
- Display Name (required)
- Description (optional, textarea)
- Provider (dropdown: openai, anthropic, together, google)
- Provider Model ID (required, text input)
- Tier (radio: free or premium)
- Price in USD (number input, disabled for free tier)
- Rate Limit (messages per day, number input, blank = unlimited)
- Trial Messages (number input, 0 = no trial)
- Metadata (JSON editor or structured form)
- Enabled (checkbox)
- Sort Order (number input)

**Grant Access Dialog**:
- User email or ID input (with autocomplete)
- Source selection (admin_grant, trial)
- Notes field (optional, for audit log)
- Submit button

**Usage Stats Dashboard** (per model):
- Total users with access
- Messages sent today/last 7 days/last 30 days
- Average messages per user
- Top 10 users by message count
- Revenue generated (for premium models)
- Trial conversion rate (trial users who purchased)

### Acceptance Criteria

- [ ] Admin can view all models (including disabled ones)
- [ ] Admin can create new model with all fields
- [ ] Admin can edit existing model
- [ ] Admin can enable/disable models with single click
- [ ] Admin can grant model access to specific user
- [ ] Admin can view usage stats per model
- [ ] Table sorting and filtering works
- [ ] Search finds models by name
- [ ] Form validation prevents invalid data
- [ ] Success/error messages display clearly
- [ ] Audit log records all admin actions (model created, edited, enabled, disabled, access granted)
- [ ] Mobile-responsive admin UI

---

## Phase 5: Testing, Analytics & Documentation ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 3-4 days
**Dependencies**: Phases 1-4 complete

### Deliverables

- [ ] 5.1: Write unit tests for model selection logic (`lib/ai/model-selection.ts`)
- [ ] 5.2: Write unit tests for rate limiting service (`lib/ai/rate-limiting.ts`)
- [ ] 5.3: Write integration tests for all API endpoints
- [ ] 5.4: Write E2E tests for user model selection flow (Playwright)
- [ ] 5.5: Write E2E tests for admin model management flow (Playwright) [P]
- [ ] 5.6: Write E2E test for trial message flow [P]
- [ ] 5.7: Write E2E test for purchase flow [P]
- [ ] 5.8: Add all analytics events to codebase
- [ ] 5.9: Verify analytics events in PostHog dashboard [P]
- [ ] 5.10: Create user documentation (`docs/user-guides/choosing-ai-models.md`) [P]
- [ ] 5.11: Create admin documentation (`docs/admin/model-management.md`) [P]
- [ ] 5.12: Add tooltips and help text to UI [P]
- [ ] 5.13: Performance testing (model selection should be <50ms p95) [P]

### Implementation Details

**Test File Locations**:
- Unit tests: `__tests__/lib/ai/model-selection.test.ts`, `__tests__/lib/ai/rate-limiting.test.ts`
- Integration tests: `__tests__/api/models/*.test.ts`, `__tests__/api/admin/models/*.test.ts`
- E2E tests: `e2e/specs/model-selection.spec.ts`, `e2e/specs/admin-model-management.spec.ts`

**Key Test Scenarios**:

**Unit Tests**:
- Model selection chooses correct model based on preferences
- Per-persona overrides work correctly
- Trial messages increment and exhaust properly
- Rate limiting enforces daily limits
- Rate limits reset at midnight
- Fallback to system default when preferred model disabled
- Entitlement checks work correctly

**Integration Tests**:
- `/api/models` returns correct data with entitlements
- `/api/profile/model-preferences` saves preferences
- `/api/models/:id/trial-status` returns accurate trial info
- Admin APIs require authentication
- Admin can't grant access to non-existent model

**E2E Tests**:
- User changes default model, sends message, correct model used
- User tries locked premium model, sees trial offer
- User exhausts trial, sees purchase prompt
- User purchases model, gets access
- Admin creates model, appears in user list
- Admin disables model, disappears from user list
- Admin grants access, user immediately has access

**Analytics Events to Add** (13 events):
```typescript
// Model selection
capture('model_selected', { modelId, personaId, isDefault, isOverride });
capture('model_preference_saved', { defaultModelId, hasOverrides });

// Purchase
capture('model_purchase_initiated', { modelId, priceCents });
capture('model_purchase_completed', { modelId, priceCents, source });

// Trial
capture('model_trial_started', { modelId, trialMessagesRemaining });
capture('model_trial_message_used', { modelId, trialMessagesRemaining });
capture('model_trial_expired_prompt', { modelId, priceCents });

// Usage
capture('model_rate_limit_hit', { modelId, dailyLimit, resetAt });
capture('model_message_sent', { modelId, personaId, isTrialMessage });

// Admin
capture('admin_model_created', { modelId, tier, priceCents });
capture('admin_model_enabled', { modelId });
capture('admin_model_disabled', { modelId });
capture('admin_model_access_granted', { modelId, userId, source });
```

**Documentation Content**:

User Docs:
- What are AI models and why choose different ones?
- How to change your default model
- How to set different models for different coaches
- Understanding trial messages
- Understanding rate limits
- How to purchase premium models

Admin Docs:
- How to add a new model to the catalog
- Setting pricing and rate limits
- Granting access to users
- Monitoring model usage
- Best practices for rate limiting

**Performance Benchmarks**:
- Model selection logic: <50ms p95
- `/api/models` endpoint: <200ms p95
- Database queries should use indexes efficiently
- No N+1 queries in model selection

### Acceptance Criteria

- [ ] All unit tests passing (>80% coverage on business logic)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Test coverage report shows adequate coverage
- [ ] All 13 analytics events implemented and firing
- [ ] Analytics events visible in PostHog dashboard
- [ ] User documentation complete and reviewed
- [ ] Admin documentation complete and reviewed
- [ ] Tooltips added to UI where helpful
- [ ] Performance benchmarks met (<50ms model selection, <200ms API)
- [ ] No regressions in existing features
- [ ] Security audit passed (entitlement checks, rate limiting)

---

## Phase 6: Deployment & Monitoring ⏸️ NOT STARTED

**Status**: ⏸️ Not Started
**Estimated Effort**: 2-3 days
**Dependencies**: Phase 5 complete

### Deliverables

- [ ] 6.1: Run database migration on staging environment
- [ ] 6.2: Seed staging with initial model catalog
- [ ] 6.3: Create Stripe products in test mode
- [ ] 6.4: Test entire flow end-to-end in staging
- [ ] 6.5: Run database migration on production
- [ ] 6.6: Seed production with initial model catalog
- [ ] 6.7: Create Stripe products in live mode
- [ ] 6.8: Set up monitoring dashboards for model usage [P]
- [ ] 6.9: Set up alerts for critical errors (rate limit failures, entitlement bypasses) [P]
- [ ] 6.10: Create rollback plan and test it [P]
- [ ] 6.11: Announce feature to users (in-app notification, email) [P]
- [ ] 6.12: Monitor for first 48 hours post-launch

### Implementation Details

**Deployment Checklist**:

**Staging**:
1. Merge feature branch to staging
2. Run migration: `npx supabase db push` (or equivalent)
3. Verify tables created
4. Verify RLS policies active
5. Verify seed data loaded
6. Create Stripe test products
7. Update `ai_models` table with Stripe IDs
8. Test user flow: change model, try trial, purchase
9. Test admin flow: create model, grant access, view stats
10. Check analytics events in PostHog

**Production**:
1. Merge to main branch
2. **Database migration**: Run migration during low-traffic window
3. **Seed data**: Load initial model catalog
4. **Stripe products**: Create live mode products, save IDs
5. **Feature flag** (if using): Keep disabled initially
6. **Smoke test**: Verify basic functionality works
7. **Enable feature**: Remove flag or enable for all users
8. **Monitor closely**: Watch error rates, API latency, purchase flow
9. **Communication**: Announce to users via in-app notification or email

**Monitoring Setup**:

**PostHog Dashboards**:
- Model selection trends (which models are popular)
- Trial-to-purchase conversion funnel
- Rate limit hit frequency
- Model usage by persona
- Revenue from model purchases

**Error Monitoring**:
- Alert on >5 rate limit errors per hour
- Alert on entitlement bypass attempts
- Alert on trial tracking failures
- Alert on model selection errors (fallback to default)

**Performance Monitoring**:
- Track model selection latency (should be <50ms)
- Track API endpoint latency
- Track database query performance

**Rollback Plan**:

If critical issues arise:
1. **Disable purchases**: Set all premium models to `enabled: false` via admin
2. **Revert user preferences**: SQL script to set all users to `gpt-4o-mini`
3. **Stop charging**: Disable Stripe products
4. **Revert code**: Deploy previous version
5. **Communicate**: Notify affected users, offer refunds if necessary
6. **Investigate**: Fix issues in staging before re-deployment

### Acceptance Criteria

- [ ] Staging deployment successful
- [ ] Production migration runs without errors
- [ ] All seed data loaded correctly in production
- [ ] Stripe products created and linked
- [ ] Monitoring dashboards set up and showing data
- [ ] Alerts configured and tested
- [ ] Rollback plan documented and tested in staging
- [ ] No production errors in first 24 hours
- [ ] Users can successfully purchase and use models
- [ ] Analytics data flowing correctly
- [ ] Support team briefed on new feature

---

## Summary

**Total Estimated Effort**: 21-28 days (4-6 weeks)

**Critical Path**:
1. Phase 1 (database) → Phase 2 (backend) → Phase 3 (user UI) → Phase 5 (testing) → Phase 6 (deploy)
2. Phase 4 (admin UI) can happen in parallel with Phase 3

**Parallelization Opportunities**:
- Phase 3 & 4 (user UI and admin UI) can be done by different developers
- Within each phase, tasks marked [P] can be parallelized
- Documentation and analytics can be done alongside implementation

**Success Criteria**:
- All 6 phases complete
- All acceptance criteria met
- Zero critical bugs in production
- >5% conversion rate on model purchases within 30 days
- >25% of users explore model settings within 30 days

**Post-Launch**:
- Monitor for 2 weeks closely
- Gather user feedback
- Iterate on trial message limits based on conversion data
- Consider adding more models based on demand
