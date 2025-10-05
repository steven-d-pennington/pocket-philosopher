# Documentation Methodology Guide

**Last Updated**: October 4, 2025
**Purpose**: Standard methodology for creating feature specifications and task breakdowns in the Pocket Philosopher project

---

## Overview

This document defines the **three-tier documentation system** used throughout this project:

1. **Master Scope** - Product vision and high-level requirements
2. **Feature Specs** - Detailed technical specifications per workstream/feature
3. **Task Files** - Phased, actionable task breakdowns with status tracking

---

## Documentation Hierarchy

```
docs/build-plan/
├── master-scope.md                    # Product vision & constraints
├── README.md                          # Index of all spec documents
├── [workstream]-spec.md              # Technical specifications
├── [feature-name]-feature.md         # Feature-specific specs
└── tasks/
    ├── README.md                      # Master execution guide & status tracker
    └── [workstream-or-feature]/
        ├── tasks.md                   # Phased task breakdown
        └── [subtopic].md              # Optional deep-dive docs
```

---

## Three-Tier Structure

### Tier 1: Master Scope Document
**Location**: `docs/build-plan/master-scope.md`

**Purpose**: Single source of truth for product vision, scope, and constraints

**Sections**:
- **Product Mission** - What we're building and why
- **Feature Scope** - High-level feature list
- **Backend & Data Scope** - Data architecture overview
- **AI & Knowledge Scope** - AI system capabilities
- **Constraints & Standards** - Tech stack, quality bars, performance requirements
- **Success Criteria** - Definition of done
- **Dependencies & Sequencing** - Major milestones and ordering

**When to Update**: Only when product vision or scope fundamentally changes

---

### Tier 2: Feature Specification Documents
**Location**: `docs/build-plan/[name].md`

**Two Types**:

#### A. Workstream Specs (Core Infrastructure)
Examples:
- `project-foundations-and-environment.md`
- `data-and-backend-infrastructure.md`
- `ai-and-knowledge-system.md`
- `frontend-architecture-and-user-experience.md`
- `analytics-observability-and-security.md`
- `testing-and-quality-assurance.md`
- `deployment-and-operations.md`

#### B. Feature Specs (Product Features)
Examples:
- `freemium-monetization-feature.md`
- `admin-dashboard-feature.md`
- `chat-buddy-mode-feature.md`

**Standard Template** (for new features):

```markdown
# [Feature Name] Feature

## Overview
[1-2 paragraphs describing the feature, its purpose, and business value]

## Architecture
[Technical approach, integration points, and design decisions]

### Deployment Strategy
- How the feature will be rolled out
- Feature flags (if applicable)
- Infrastructure requirements

### Security Model
- Access control approach
- Data protection requirements
- Authentication/authorization strategy

## Feature Requirements

### Phase 1: [Foundation Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- Core requirements
- Database schema changes
- API endpoints needed

### Phase 2: [Implementation Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- UI components
- Business logic
- Integration work

### Phase 3: [Polish & Launch Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- Testing and quality assurance
- Analytics and monitoring
- Documentation

## Database Schema

### Existing Tables (Extended)
[Tables that will be modified with new columns/indexes]

### New Tables
[Complete schema for new tables]

```sql
CREATE TABLE example_table (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  -- ... columns
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_example ON example_table(user_id);

-- RLS Policies
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own records"
  ON example_table FOR ALL
  USING (auth.uid() = user_id);
```

## API Design

### New Endpoints

```
GET    /api/feature/resource       - Description
POST   /api/feature/resource       - Description
PATCH  /api/feature/resource/:id   - Description
DELETE /api/feature/resource/:id   - Description
```

**Request/Response Examples**:

```typescript
// POST /api/feature/resource
Request: {
  field: "value"
}

Response: {
  data: { /* payload */ },
  meta: { requestId, timestamp }
}
```

## UI/UX Design

### User Flows
[Step-by-step user interaction flows]

### Component Structure
- `components/feature/` - Feature-specific components
- `app/(dashboard)/feature/` - Route pages
- `lib/hooks/use-feature.ts` - Custom hooks

### Accessibility Considerations
- Keyboard navigation requirements
- ARIA labels needed
- Screen reader support

## State Management

### Zustand Stores (if needed)
```typescript
// lib/stores/feature-store.ts
interface FeatureState {
  // State shape
  // Actions
}
```

### API Integration
- TanStack Query keys
- Mutation patterns
- Cache invalidation strategy

## Security Considerations

### Access Control
- Who can access this feature
- Role-based permissions
- Entitlement checks (if premium feature)

### Data Protection
- Sensitive data handling
- Encryption requirements
- RLS policies

### Input Validation
- Zod schemas
- Sanitization requirements
- Rate limiting

## Testing Strategy

### Unit Tests
- Critical business logic
- Utility functions
- Component tests

### Integration Tests
- API endpoint tests
- Database transaction tests

### E2E Tests
- User flow tests (Playwright)
- Critical path coverage

## Analytics & Observability

### Events to Track
```typescript
// PostHog events
- feature_action_completed
- feature_error_occurred
- feature_engagement_metric
```

### Metrics & KPIs
- User adoption rate
- Feature usage frequency
- Error rates
- Performance benchmarks

### Logging
- Structured log points
- Error tracking
- Debug information

## Deployment Strategy

### Rollout Plan
1. **Development** - Local testing
2. **Staging** - Full feature testing
3. **Production** - Gradual rollout with monitoring

### Feature Flags (if applicable)
```env
ENABLE_FEATURE_NAME=true
```

### Migration Plan
- Database migrations sequence
- Data backfill requirements (if any)
- Rollback procedure

## Success Metrics

### Launch Criteria
- [ ] All acceptance criteria met
- [ ] Tests passing (unit, integration, E2E)
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Documentation complete

### Post-Launch Metrics
- User adoption targets
- Performance SLAs
- Error rate thresholds
- User satisfaction scores

## Risk Mitigation
- Potential risks and impact
- Mitigation strategies
- Rollback plan

## Future Enhancements
- Post-MVP improvements
- Scalability considerations
- Integration opportunities

---

## Dependencies & Prerequisites
- What must be complete before starting
- External service dependencies
- Team coordination needs
```

---

### Tier 3: Task Breakdown Files
**Location**: `docs/build-plan/tasks/[feature-name]/tasks.md`

**Purpose**: Translate specs into actionable, trackable work items

**Standard Template**:

```markdown
# [Feature Name] Tasks

## Phase 1: [Foundation Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- [ ] Task 1: Description (file paths, specific action)
- [ ] Task 2: Description
- [ ] Task 3: Description [P]

**Implementation Details**:
- Technical notes about how to implement
- File locations: `path/to/file.ts`
- Dependencies: Requires Phase X from Workstream Y
- Example code or patterns to follow

**Acceptance Criteria**:
- [ ] Criterion 1: Specific, measurable outcome
- [ ] Criterion 2: Specific, measurable outcome
- [ ] Tests passing
- [ ] Documentation updated

---

## Phase 2: [Implementation Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- [ ] Task 1: Description
- [ ] Task 2: Description [P]
- [ ] Task 3: Description

**Implementation Details**:
- Technical approach
- Integration points
- Code examples

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

---

## Phase 3: [Polish & Launch Phase Name]
**Status**: ⏸️ Not Started
**Deliverables**:
- [ ] Task 1: Testing coverage
- [ ] Task 2: Analytics integration [P]
- [ ] Task 3: Documentation

**Implementation Details**:
- Test scenarios
- Analytics events to add
- Docs to update

**Acceptance Criteria**:
- [ ] All tests passing
- [ ] Analytics verified in dashboard
- [ ] Documentation reviewed
- [ ] Ready for production
```

---

## Status Indicators

Use these standard status markers throughout task files:

| Indicator | Meaning | Usage |
|-----------|---------|-------|
| ⏸️ **Not Started** | Work not begun | Default for planned tasks |
| 🔄 **In Progress** | Actively being worked on | Update when starting |
| ✅ **Complete** | Fully implemented and tested | Update when done |
| **[P]** | Can be parallelized | Add to independent tasks |

**Status Pattern**:
```markdown
## Phase 1: Foundation
**Status**: ✅ COMPLETE
1. ✅ Task 1
2. ✅ Task 2
3. ✅ Task 3 [P]

## Phase 2: Implementation
**Status**: 🔄 IN PROGRESS
1. ✅ Task 1
2. 🔄 Task 2 (currently working on this)
3. ⏸️ Task 3 [P]

## Phase 3: Polish
**Status**: ⏸️ NOT STARTED
```

---

## Parallelization Markers

**[P] Tag Usage**:
- Add `[P]` to tasks that can be done in parallel with other tasks
- These tasks have no blocking dependencies within the same phase
- Enables team members to work concurrently

**Example**:
```markdown
## Phase 2: Implementation
1. Build core API endpoint (blocks task 2)
2. Implement business logic (requires task 1)
3. Add analytics events [P] (independent)
4. Write unit tests [P] (independent)
5. Update documentation [P] (independent)
```

Tasks 3, 4, and 5 can all be done in parallel by different people once task 2 is complete.

---

## Master Tracking Documents

### A. Spec Index (`docs/build-plan/README.md`)

**Purpose**: Index of all specification documents

**Template**:
```markdown
# Pocket Philosopher Build Plan

This directory contains the comprehensive build plan derived from the requirements in the `build_specs` folder. Each document focuses on a major workstream needed to deliver the Pocket Philosopher application.

## Documents

### Core Workstreams
- [Project Foundations & Environment](project-foundations-and-environment.md)
- [Data & Backend Infrastructure](data-and-backend-infrastructure.md)
- [AI & Knowledge System](ai-and-knowledge-system.md)
- [Frontend Architecture & User Experience](frontend-architecture-and-user-experience.md)
- [Analytics, Observability & Security](analytics-observability-and-security.md)
- [Testing & Quality Assurance](testing-and-quality-assurance.md)
- [Deployment & Operations](deployment-and-operations.md)

### Product Features
- [Freemium Monetization Feature](freemium-monetization-feature.md)
- [Admin Dashboard Feature](admin-dashboard-feature.md)
- [Chat Buddy Mode Feature](chat-buddy-mode-feature.md)
- [New Feature Name](new-feature-name.md)  <!-- Add new features here -->

Each document provides detailed tasks and instructions to guide implementation for its respective area.
```

---

### B. Execution Guide (`docs/build-plan/tasks/README.md`)

**Purpose**: Step-by-step execution sequence with status tracking

**Template Section for New Features**:
```markdown
## Step-by-Step Execution

[... existing steps ...]

X. **[Feature Name]** (New Feature - YYYY-MM-DD)
   - **Status:** Not Started (All 3 phases pending).
   - [1-2 sentence description of what this feature does and why it's important]
   - [Dependencies or prerequisites if any]
```

**Status Update Pattern**:
```markdown
X. **[Feature Name]** (New Feature - 2025-10-05)
   - **Status:** 60% Complete (Phase 1 complete - database schema and API routes; Phase 2 in progress - UI components 50% done; Phase 3 not started).
   - Description of current state and what remains
```

---

## Step-by-Step: Creating a New Feature

### Step 1: Create Feature Spec Document

1. **Copy template structure** from this guide
2. **Create file**: `docs/build-plan/[feature-name]-feature.md`
3. **Fill in all sections**:
   - Overview and architecture
   - Phase-by-phase requirements
   - Database schema changes
   - API endpoints
   - UI/UX design
   - Security considerations
   - Testing strategy
   - Success metrics

### Step 2: Create Task Breakdown

1. **Create directory**: `docs/build-plan/tasks/[feature-name]/`
2. **Create file**: `docs/build-plan/tasks/[feature-name]/tasks.md`
3. **Break down each phase** into specific, actionable tasks
4. **Add implementation details** (file paths, code patterns)
5. **Define acceptance criteria** for each phase
6. **Mark parallelizable tasks** with [P]

### Step 3: Update Master Documents

1. **Add to spec index** (`docs/build-plan/README.md`):
   ```markdown
   - [Feature Name Feature](feature-name-feature.md)
   ```

2. **Add to execution guide** (`docs/build-plan/tasks/README.md`):
   ```markdown
   X. **[Feature Name]** (New Feature - YYYY-MM-DD)
      - **Status:** Not Started (All phases pending)
      - Brief description
   ```

3. **(Optional) Update master scope** if the feature changes product vision

### Step 4: Maintain Status

As work progresses:

1. **Update task statuses** in `tasks/[feature-name]/tasks.md`:
   - Change ⏸️ to 🔄 when starting
   - Change 🔄 to ✅ when complete

2. **Update execution guide** with progress summaries:
   ```markdown
   - **Status:** 40% Complete (Phase 1 complete; Phase 2 40% done)
   ```

3. **Check off deliverables** and acceptance criteria

---

## Best Practices

### Writing Clear Tasks

✅ **Good Task**:
```markdown
- [ ] Create `lib/hooks/use-notifications.ts` hook with `subscribe()`, `unsubscribe()`, and `getPermission()` methods
```

❌ **Bad Task**:
```markdown
- [ ] Add notification support
```

### Writing Acceptance Criteria

✅ **Good Criteria**:
```markdown
- [ ] User can subscribe to notifications via settings page
- [ ] Push notifications appear within 5 seconds of trigger
- [ ] Notification preferences persist across sessions
- [ ] E2E test covers notification flow end-to-end
```

❌ **Bad Criteria**:
```markdown
- [ ] Notifications work
- [ ] Tests pass
```

### Organizing Phases

**Phase 1** should always focus on:
- Database schema
- Core API endpoints
- Basic data models

**Phase 2** should focus on:
- Business logic implementation
- UI components
- State management

**Phase 3** should focus on:
- Testing and quality
- Analytics and monitoring
- Documentation and polish

---

## File Naming Conventions

### Spec Documents
- **Format**: `[feature-name]-feature.md`
- **Examples**:
  - `freemium-monetization-feature.md`
  - `push-notifications-feature.md`
  - `social-sharing-feature.md`

### Task Directories
- **Format**: `tasks/[feature-name]/`
- **Examples**:
  - `tasks/freemium-monetization/`
  - `tasks/push-notifications/`
  - `tasks/social-sharing/`

### Task Files
- **Main file**: `tasks/[feature-name]/tasks.md`
- **Optional deep-dives**: `tasks/[feature-name]/[subtopic].md`
  - Example: `tasks/ai-and-knowledge-system/provider-abstraction.md`

---

## Common Patterns

### Database Schema Section
```markdown
## Database Schema

### New Tables
CREATE TABLE feature_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feature_user ON feature_table(user_id);
CREATE INDEX idx_feature_created ON feature_table(created_at DESC);

-- RLS Policies
ALTER TABLE feature_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own records"
  ON feature_table FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_feature_updated_at
  BEFORE UPDATE ON feature_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### API Endpoint Documentation
```markdown
### POST /api/feature/action

**Purpose**: Description of what this endpoint does

**Authentication**: Required (user session)

**Request**:
```typescript
{
  field: string;
  optional_field?: number;
}
```

**Response**:
```typescript
{
  data: {
    id: string;
    result: string;
  },
  meta: {
    requestId: string;
    timestamp: string;
  }
}
```

**Error Responses**:
- `401 Unauthorized` - No valid session
- `403 Forbidden` - Missing entitlement
- `400 Bad Request` - Invalid input
- `500 Internal Server Error` - Server error

**Rate Limiting**: 100 requests per minute
```

### Component Documentation
```markdown
### Component Structure

```
components/feature/
├── feature-list.tsx          # Main list component
├── feature-card.tsx          # Individual item card
├── feature-modal.tsx         # Create/edit modal
└── feature-actions.tsx       # Action buttons
```

**State Management**:
- Store: `lib/stores/feature-store.ts`
- Hook: `lib/hooks/use-feature.ts`
- Query keys: `['feature', userId]`
```

---

## Examples

See existing documentation for reference:

- **Complete Feature Spec**: `docs/build-plan/freemium-monetization-feature.md`
- **Task Breakdown**: `docs/build-plan/tasks/freemium-monetization/tasks.md`
- **Workstream Spec**: `docs/build-plan/ai-and-knowledge-system.md`
- **Task Tracking**: `docs/build-plan/tasks/ai-and-knowledge-system/tasks.md`

---

## Quick Reference Card

### Creating New Feature Documentation

```bash
# 1. Create spec document
docs/build-plan/[feature-name]-feature.md

# 2. Create task breakdown
docs/build-plan/tasks/[feature-name]/tasks.md

# 3. Update master index
docs/build-plan/README.md

# 4. Update execution guide
docs/build-plan/tasks/README.md

# 5. (Optional) Update master scope
docs/build-plan/master-scope.md
```

### Status Indicators
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Complete
- [P] Parallelizable

### Standard Phases
1. **Foundation** - Schema, APIs, data models
2. **Implementation** - Logic, UI, integration
3. **Polish** - Testing, analytics, docs

---

**This methodology ensures**:
- ✅ Consistent documentation structure across all features
- ✅ Clear tracking of progress and status
- ✅ Easy onboarding for new team members or AI agents
- ✅ Coordinated work across parallel workstreams
- ✅ Historical record of implementation decisions

---

**Last Updated**: October 4, 2025
**Maintained By**: Pocket Philosopher Team
**Questions?**: Refer to existing feature docs for examples
