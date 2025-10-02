# Admin Dashboard - Priority Features

## Executive Summary
Based on current needs and platform capabilities, here are the prioritized admin features for immediate implementation. Focus is on user account management, entitlement control, and persona configuration.

---

## 🔥 Priority 1: Critical Admin Features (Implement Now)

### 1.1 User Account Management
**Why**: Direct user support capability, essential for customer service

**Features**:
- **View User Details**: Complete profile, purchase history, usage stats, last active
- **Account Actions**:
  - Disable/Enable account (soft ban without deletion)
  - Reset password (send reset email via Supabase)
  - Update profile fields (virtue focus, persona preference, experience level)
  - View conversation history (number of messages, active personas)
- **Search & Filter**:
  - By email, persona preference, experience level, account status
  - By purchase status (free user, paid user, specific entitlements)
  - By activity (active within X days, inactive users)

**Database Support**: ✅ Complete
- `profiles` table has all necessary fields
- `is_admin` flag for role checking
- Supabase auth integration ready

**UI Location**: Enhance existing `/admin/users` page

---

### 1.2 Entitlement Management
**Why**: Support team needs to comp users, fix purchase issues, test features

**Features**:
- **Grant Entitlement**: Give free access to premium personas for testing/support
  - Select user (autocomplete search)
  - Select product (coach-lao, coach-simone, etc.)
  - Optional expiration date
  - Reason/notes field for audit trail
- **Revoke Entitlement**: Remove access (with confirmation)
- **View Entitlement History**:
  - All user entitlements with granted_at dates
  - Purchase method (stripe, manual grant, promo)
  - Expiration status
- **Bulk Actions**:
  - Grant beta access to multiple users
  - Extend expiration dates

**Database Support**: ✅ Complete
- `entitlements` table ready
- `purchases` table for tracking origins
- `admin_audit_log` for tracking grants/revokes

**UI Location**: New `/admin/entitlements` page + user detail view

---

### 1.3 Persona Configuration Editor
**Why**: Adjust pricing, features, availability without code deployments

**Features**:
- **Persona Settings**:
  - Edit display name, title, description
  - Toggle availability (hide persona temporarily)
  - Set pricing ($3.99 or custom)
  - Mark as "Free" or "Premium"
- **Prompt Configuration**:
  - Edit system prompts (buddy mode, coaching mode)
  - Adjust temperature, max tokens
  - Edit signature practices, virtues, expertise tags
- **Preview Changes**: See how persona appears before saving
- **Version History**: Track changes to persona configs (using `content_versions` table)

**Database Support**: 🟡 Partial
- ✅ `content_versions` table exists for versioning
- ❌ Need `persona_configs` table for database-driven personas
- Current: Personas are hardcoded in `lib/ai/personas.ts`

**Options**:
1. **Quick Win**: Edit pricing/availability only (store in `app_settings`)
2. **Full Solution**: Move personas to database for full editability

**UI Location**: New `/admin/personas` page

---

## ⚡ Priority 2: High-Value Enhancements

### 2.1 Purchase Issue Resolution
**Why**: Handle refunds, disputes, failed payments

**Features**:
- Issue manual refunds (without Stripe dashboard)
- View failed payment attempts
- Retry failed purchases
- Manual purchase recording (for offline/promo purchases)

**UI Location**: Enhance `/admin/purchases` page

---

### 2.2 Content Performance Analytics
**Why**: Understand which philosophy content resonates most

**Features**:
- Top-cited philosophy chunks by persona
- Least-used content (candidates for removal)
- Citation quality scores
- Search relevance feedback

**UI Location**: Enhance `/admin/content` or `/admin/analytics`

---

### 2.3 Audit Log Viewer
**Why**: Track admin actions, debug issues, compliance

**Features**:
- Searchable audit log (by admin, action type, resource, date range)
- Filter by resource type (user, entitlement, persona, purchase)
- Export to CSV for compliance reporting
- Real-time activity feed

**Database Support**: ✅ Complete
- `admin_audit_log` table exists with indexes

**UI Location**: New `/admin/audit` page

---

## 🎯 Priority 3: Nice-to-Have Features

### 3.1 User Communication
- Send email to user (password reset, support message)
- Bulk email to user segments (beta testers, inactive users)
- In-app notification system

### 3.2 Feature Flags & A/B Testing
- Toggle features for specific user segments
- A/B test pricing, personas, prompts
- Gradual rollout controls

### 3.3 System Health Monitoring
- Real-time error tracking
- API latency dashboards
- Database performance metrics
- AI provider health status

### 3.4 Revenue Analytics
**Status**: ✅ Already implemented in `/admin/analytics`
- Daily/weekly/monthly revenue
- Conversion funnels
- Cohort analysis

---

## 📋 Recommended Implementation Order

### Phase A: User Support Essentials (6-8 hours)
1. ✅ User detail view with full profile
2. ✅ Account enable/disable toggle
3. ✅ Password reset trigger
4. ✅ Profile field editing
5. ✅ Enhanced user search/filtering

### Phase B: Entitlement Control (4-6 hours)
1. ✅ Grant entitlement UI (user search + product selector)
2. ✅ Revoke entitlement with confirmation
3. ✅ Entitlement history viewer
4. ✅ Audit logging integration
5. ✅ User detail entitlements tab

### Phase C: Persona Management (6-8 hours)
**Option 1: Quick Win** (2-3 hours)
- Pricing/availability editor in `app_settings`
- No code changes needed for price updates

**Option 2: Full Solution** (6-8 hours)
- Create `persona_configs` table
- Migrate personas to database
- Full persona editor UI
- Prompt configuration interface

### Phase D: Advanced Features (as needed)
- Audit log viewer (3-4 hours)
- Purchase issue resolution (4-6 hours)
- Content analytics enhancements (3-4 hours)

---

## 🗄️ Required Database Changes

### Minimal Approach (Option 1)
No new tables needed - use existing `app_settings`:
```sql
-- Store persona overrides in app_settings
INSERT INTO app_settings (key, value) VALUES
('persona_pricing', '{"lao": 3.99, "simone": 4.99, "epictetus": 3.99, ...}'),
('persona_availability', '{"lao": true, "simone": true, ...}');
```

### Full Approach (Option 2)
New table for database-driven personas:
```sql
CREATE TABLE persona_configs (
  id TEXT PRIMARY KEY,  -- 'marcus', 'lao', etc.
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tradition TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  price_cents INTEGER,
  system_prompt_buddy TEXT,
  system_prompt_coaching TEXT,
  temperature NUMERIC DEFAULT 0.6,
  max_tokens INTEGER DEFAULT 1000,
  virtues TEXT[] DEFAULT '{}',
  expertise TEXT[] DEFAULT '{}',
  signature_practices TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI/UX Recommendations

### User Detail Page
**Route**: `/admin/users/[userId]`

**Layout**:
```
┌─────────────────────────────────────────┐
│ User Profile                            │
│ steven@example.com                      │
│ [Active] [Reset Password] [Edit]       │
├─────────────────────────────────────────┤
│ Tabs: Overview | Entitlements | Activity│
├─────────────────────────────────────────┤
│ Overview Tab:                           │
│   - Profile fields (virtue, persona)    │
│   - Account created, last active        │
│   - Usage stats (conversations, habits) │
│                                         │
│ Entitlements Tab:                       │
│   - Current entitlements list           │
│   - [+ Grant Entitlement] button        │
│   - Purchase history                    │
│                                         │
│ Activity Tab:                           │
│   - Recent conversations                │
│   - Habit completion trends             │
│   - Engagement metrics                  │
└─────────────────────────────────────────┘
```

### Entitlements Management
**Route**: `/admin/entitlements`

**Features**:
- Search users by email
- "Quick Grant" button → modal with user search + product selector
- Table of all entitlements with filters (product, status, granted by)
- Bulk actions for beta testing

### Persona Editor (if implemented)
**Route**: `/admin/personas`

**Features**:
- List of all 6 personas with edit buttons
- Edit modal/page with tabs:
  - Basic Info (name, title, description)
  - Pricing & Availability
  - Prompts (buddy, coaching modes)
  - AI Settings (temperature, max tokens)
  - Expertise & Virtues
- Preview pane showing how persona appears to users
- Save with version tracking

---

## 🔒 Security Considerations

### Audit Logging
**Critical**: Log all admin actions to `admin_audit_log`
- User account changes (disable, reset password, profile edit)
- Entitlement grants/revokes
- Persona configuration changes
- Include: admin_user_id, action, resource_type, resource_id, old_values, new_values

### Access Control
- All admin routes protected by `ADMIN_DASHBOARD=true` + `is_admin` flag
- Entitlement grants require admin confirmation
- Password resets send email (don't expose passwords)
- User disable is soft (data retained for GDPR compliance)

### Input Validation
- Validate user IDs exist before operations
- Validate product IDs match available products
- Sanitize all text inputs (XSS prevention)
- Rate limit admin actions (prevent abuse)

---

## 📊 Success Metrics

### Implementation Success
- ✅ User account operations work without errors
- ✅ Entitlement grants appear immediately in user UI
- ✅ Persona config changes apply without code deploy
- ✅ All admin actions logged to audit trail

### Support Efficiency
- Reduce support ticket resolution time by 50%
- Self-service entitlement grants (no developer needed)
- Real-time user issue diagnosis

### Platform Control
- Dynamic pricing adjustments without deployment
- Quick feature toggles for testing/rollback
- Comprehensive audit trail for compliance

---

## Next Steps

1. **Review & Approve**: Confirm priority order matches your needs
2. **Choose Persona Approach**: Quick win (pricing only) vs. full editor
3. **Begin Phase A**: User account management implementation
4. **Iterate**: Add features based on support team feedback

Estimated Total Time:
- **Phase A + B** (Essentials): 10-14 hours
- **Phase C Option 1** (Quick): +2-3 hours = 12-17 hours total
- **Phase C Option 2** (Full): +6-8 hours = 16-22 hours total
