# Freemium Monetization Tasks

## Phase 1: Database Schema and Product Setup
**Status**: ✅ Complete
**Deliverables**:
- ✅ Create products, purchases, and entitlements tables
- ✅ Seed product catalog with coach SKUs ($3.99 each)
- ✅ Add database migrations and RLS policies
**Implementation Details**:
- Tables created in database/schema.sql with proper constraints
- RLS policies configured for user-owned data
- Indexes added for performance
**Acceptance Criteria**:
- ✅ All tables created and populated
- ✅ Schema validated in staging environment

## Phase 2: Payment Integration and Webhooks
**Status**: ✅ Complete
**Deliverables**:
- ✅ Implement /api/purchases/create-session endpoint
- ✅ Add Stripe webhook handler for payment completion
- ✅ Configure webhook signature verification
**Implementation Details**:
- Created app/api/purchases/create-session/route.ts with Stripe checkout session creation
- Created app/api/purchases/webhook/route.ts for payment event handling
- Entitlement checking and duplicate purchase prevention implemented
- Success/cancel redirect URLs configured
**Acceptance Criteria**:
- ✅ Successful test payments in staging
- ✅ Webhook events processed correctly
- ✅ Purchase records created and entitlements granted

## Phase 3: Frontend UI and Entitlement Enforcement
**Status**: ✅ Complete
**Deliverables**:
- ✅ Update coach selection UI with locked/unlocked states
- ✅ Add purchase flow and restore purchases functionality
- ✅ Implement entitlement checking middleware
**Implementation Details**:
- ✅ Updated PersonaSidebar in components/marcus/coach-workspace.tsx with lock indicators
- ✅ Added Lock icons and $3.99 pricing badges for premium coaches
- ✅ Implemented handlePurchase() to redirect to Stripe checkout
- ✅ Added "Restore Purchases" button with refreshEntitlements()
- ✅ Created useEntitlements() hook in lib/hooks/use-entitlements.ts
- ✅ Added server-side entitlement enforcement in app/api/marcus/route.ts (403 for unauthorized access)
- ✅ Marcus coach remains free, all other personas require purchase
**Acceptance Criteria**:
- ✅ Free coaches accessible without payment (Marcus is free)
- ✅ Premium coaches show purchase prompts (Lock icon, price badge, "Tap to purchase")
- ✅ Entitlements enforced server-side for API calls (403 error returned for unauthorized persona access)

## Phase 4: Testing, Analytics, and Deployment
**Status**: Not Started
**Deliverables**:
- Unit and integration tests for payment flows
- Analytics events for purchase tracking
- Production deployment and monitoring setup
**Acceptance Criteria**:
- All tests passing
- Analytics data flowing correctly
- Successful production rollout with rollback plan