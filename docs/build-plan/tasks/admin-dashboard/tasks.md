# Admin Dashboard Tasks

## Implementation Priority Summary

**Updated**: 2025-10-02 - Refocused on critical admin features

### Immediate Priorities (Next 16-22 hours)
1. **Phase 2: User Account Management** (6-8 hours) - User detail page, enable/disable, password reset, profile editing
2. **Phase 3: Entitlement Management** (4-6 hours) - Grant/revoke entitlements, history viewer
3. **Phase 4: Persona Configuration** (2-3 hours OR 6-8 hours) - Choose Quick Win or Full Solution

### Completed ✅
- Phase 1: Admin authentication, basic dashboard, environment protection
- Revenue analytics (in /admin/analytics)
- Content overview (in /admin/content)
- Purchase viewer (in /admin/purchases)
- System settings (in /admin/settings)

### Deferred 🔄
- Bulk user operations and export
- Advanced purchase management (refunds, disputes)
- GDPR anonymization tools
- Audit log viewer UI (database ready)

See [admin-dashboard-priorities.md](../../admin-dashboard-priorities.md) for detailed feature analysis and recommendations.

---

## Phase 1: Admin Authentication and Basic Dashboard
**Status**: ✅ Completed
**Deliverables**:
- ✅ Create admin role and permissions in database schema
- ✅ Implement admin authentication middleware and routes
- ✅ Build basic admin dashboard layout with navigation
- ✅ Add admin user creation and role management
**Implementation Details**:
- Extended `profiles` table with `is_admin` boolean column
- Created `admin_audit_log` table for tracking admin actions
- Implemented RLS policies for admin data access
- Built `adminAuthMiddleware` for route protection
- Created admin API routes: `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/users/[userId]`
- Built admin layout component with sidebar navigation and logout
- Created admin dashboard page with metrics and recent activity
- Set up admin route structure with authentication guards
**Acceptance Criteria**:
- ✅ Admin users can log in via dedicated admin portal
- ✅ Basic dashboard shows system overview metrics
- ✅ Role-based access control prevents unauthorized access
- ✅ Admin routes isolated from public API

## Phase 2: User Account Management (PRIORITY - Updated Scope)
**Status**: 🚧 In Progress (30% - Basic list view done, need detail page and actions)
**Time Estimate**: 6-8 hours

### 2.1 User Detail View ⏸️ Not Started
**Deliverables**:
- Create /admin/users/[userId] detail page
- Tabbed interface (Overview, Entitlements, Activity)
- Display full profile (virtue, persona, experience level, timezone, etc.)
- Show account status (created_at, last_active_at, onboarding_complete)
- Display usage statistics (conversation count, habits count, reflections count)
- Show purchase history and current entitlements

**Files to Create/Modify**:
- `app/admin/users/[userId]/page.tsx` - Main detail page
- `components/admin/user-detail-tabs.tsx` - Tab navigation component
- `components/admin/user-profile-card.tsx` - Profile display component
- `app/api/admin/users/[userId]/route.ts` - User detail API endpoint

### 2.2 Account Management Actions ⏸️ Not Started
**Deliverables**:
- **Enable/Disable Account**: Toggle user access without deletion
  - Add `is_disabled` field to profiles table
  - Disable prevents login but preserves data
  - UI toggle with confirmation dialog
- **Reset Password**: Trigger password reset email via Supabase
  - Call `supabase.auth.admin.resetPasswordForEmail()`
  - Show success message with confirmation
- **Edit Profile**: Update user fields
  - Preferred virtue, persona, experience level
  - Notification settings, timezone
  - Form with validation

**Files to Create/Modify**:
- `app/api/admin/users/[userId]/disable/route.ts` - Disable/enable account
- `app/api/admin/users/[userId]/reset-password/route.ts` - Trigger password reset
- `app/api/admin/users/[userId]/update/route.ts` - Update profile fields
- `components/admin/account-actions.tsx` - Action buttons component
- `components/admin/user-edit-form.tsx` - Profile editing form

### 2.3 Enhanced Search & Filtering ⏸️ Not Started
**Deliverables**:
- Filter by account status (active, disabled, onboarding incomplete)
- Filter by purchase status (free users, paid users, specific entitlements)
- Filter by activity (active within 7/30/90 days)
- Sort by created_at, last_active_at, purchase count

**Files to Modify**:
- `app/admin/users/page.tsx` - Add filter UI
- `app/api/admin/users/route.ts` - Add filter parameters to query

### 2.4 Audit Logging Integration ⏸️ Not Started
**Deliverables**:
- Log all account actions (disable, enable, reset password, profile edit)
- Record admin_user_id, action, resource_type, resource_id, old_values, new_values
- Include IP address and user agent from request

**Files to Create**:
- `lib/admin/audit-log.ts` - Audit logging helper functions

**Acceptance Criteria**:
- ✅ User detail page shows complete profile and statistics
- ✅ Account can be disabled/enabled with confirmation
- ✅ Password reset email sent successfully
- ✅ Profile fields can be edited and saved
- ✅ All actions logged to admin_audit_log table
- ✅ Enhanced search and filtering works correctly

## Phase 3: Entitlement Management (PRIORITY - New Phase)
**Status**: ⏸️ Not Started
**Time Estimate**: 4-6 hours

### 3.1 Grant Entitlement UI ⏸️ Not Started
**Deliverables**:
- Create /admin/entitlements page
- "Quick Grant" button with modal
- User search (autocomplete by email)
- Product selector dropdown (coach-lao, coach-simone, etc.)
- Optional expiration date picker
- Reason/notes field for audit trail
- Success/error notifications

**Files to Create**:
- `app/admin/entitlements/page.tsx` - Main entitlements page
- `components/admin/grant-entitlement-modal.tsx` - Grant UI modal
- `components/admin/user-autocomplete.tsx` - User search component
- `app/api/admin/entitlements/grant/route.ts` - Grant entitlement API

### 3.2 Revoke Entitlement ⏸️ Not Started
**Deliverables**:
- Revoke button on entitlements table
- Confirmation dialog ("Are you sure? This will remove access.")
- Reason field (for audit)
- Update entitlements.is_active = false
- Log to admin_audit_log

**Files to Create**:
- `app/api/admin/entitlements/[entitlementId]/revoke/route.ts` - Revoke API
- `components/admin/revoke-confirmation-dialog.tsx` - Confirmation UI

### 3.3 Entitlement History Viewer ⏸️ Not Started
**Deliverables**:
- Table of all entitlements with filters
- Columns: User, Product, Status, Granted At, Granted By, Expires At, Source (stripe/manual)
- Filter by product, status (active/revoked), granted by admin
- Search by user email
- Export to CSV

**Files to Modify**:
- `app/admin/entitlements/page.tsx` - Add history table
- `app/api/admin/entitlements/route.ts` - List entitlements with filters

### 3.4 User Detail Entitlements Tab ⏸️ Not Started
**Deliverables**:
- Show all user entitlements in user detail page
- Display purchase method (stripe vs manual grant)
- Show expiration dates
- Quick grant/revoke buttons
- Link to full purchase details

**Files to Modify**:
- `app/admin/users/[userId]/page.tsx` - Add Entitlements tab
- `components/admin/user-entitlements-tab.tsx` - Tab content component

**Acceptance Criteria**:
- ✅ Admins can grant entitlements to any user
- ✅ Entitlements appear immediately in user UI
- ✅ Revoke removes access and logs reason
- ✅ All grants/revokes logged to admin_audit_log
- ✅ History viewer shows all entitlements with search/filter
- ✅ User detail page shows entitlements tab

---

## Phase 4: Persona Configuration (PRIORITY - New Phase)
**Status**: ⏸️ Not Started
**Time Estimate**: Choose one option

### Option 1: Quick Win - Pricing & Availability Only (2-3 hours)
**Deliverables**:
- Simple form to edit persona pricing in app_settings
- Toggle persona availability (hide from users)
- No code deploy needed for price changes

**Implementation**:
- Store overrides in `app_settings` table:
  ```json
  {
    "persona_pricing": {"lao": 3.99, "simone": 4.99, ...},
    "persona_availability": {"lao": true, "simone": false, ...}
  }
  ```
- Modify pricing check in UI to read from settings
- Modify persona list to filter by availability

**Files to Create/Modify**:
- `app/admin/personas/page.tsx` - Simple pricing editor
- `app/api/admin/personas/route.ts` - Update pricing/availability
- `lib/ai/personas.ts` - Read from app_settings if available

### Option 2: Full Solution - Database-Driven Personas (6-8 hours)
**Deliverables**:
- Create `persona_configs` table
- Migrate hardcoded personas to database
- Full editor for all persona fields:
  - Basic info (name, title, description)
  - Pricing & availability
  - System prompts (buddy, coaching modes)
  - AI settings (temperature, max tokens)
  - Virtues, expertise, signature practices
- Version history tracking
- Preview changes before saving

**Database Migration Required**:
```sql
CREATE TABLE persona_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  price_cents INTEGER,
  system_prompt_buddy TEXT,
  system_prompt_coaching TEXT,
  temperature NUMERIC DEFAULT 0.6,
  virtues TEXT[],
  expertise TEXT[],
  version INTEGER DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to Create**:
- `database/migrations/add_persona_configs.sql` - Migration
- `app/admin/personas/page.tsx` - Persona list
- `app/admin/personas/[personaId]/page.tsx` - Persona editor
- `app/api/admin/personas/[personaId]/route.ts` - CRUD API
- `lib/ai/persona-loader.ts` - Load from DB instead of hardcoded

**Acceptance Criteria** (Option 1):
- ✅ Admins can change persona pricing
- ✅ Admins can hide/show personas
- ✅ Changes apply immediately without deployment

**Acceptance Criteria** (Option 2):
- ✅ All persona fields editable in UI
- ✅ Changes versioned and tracked
- ✅ Preview shows how persona appears to users
- ✅ No code deploy needed for persona updates

---

## Phase 5: Purchase & Revenue Management (Lower Priority)
**Status**: ⏸️ Not Started
**Note**: Revenue analytics already implemented in /admin/analytics

**Remaining Features**:
- Manual refund processing
- Failed payment retry
- Manual purchase recording (for offline/promo sales)

---

## Additional Admin Features (Deferred)

### Audit Log Viewer
- Searchable audit log UI
- Filter by admin, action type, resource, date range
- Export to CSV for compliance

### Advanced Content Management
- Philosophy content editor with rich text support
- Content approval workflow and versioning
- Direct corpus manipulation

### System Health & Monitoring
- Real-time error tracking dashboard
- API latency monitoring
- Database performance metrics
- AI provider health status

### User Communication
- Send email to individual users
- Bulk email to user segments
- In-app notification system</content>
<parameter name="filePath">c:\projects\pocket-philosopher\docs\build-plan\admin-dashboard-feature.md