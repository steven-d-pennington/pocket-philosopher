# Community Features - Task Breakdown

**Feature**: Community Features v1
**Total Estimated Time**: 3-4 weeks
**Status**: ⏸️ Not Started

---

## Phase 1: Database & Backend Infrastructure (Week 1)
**Duration**: 5-7 days
**Status**: ⏸️ Not Started

### 1.1 Database Schema & Migrations [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create migration: `community_posts` table with all fields and indexes
  - File: `supabase/migrations/YYYYMMDD_create_community_tables.sql`
  - Columns: id, user_id, display_name, content_type, content_text, content_metadata, source_id, source_table, virtue, persona_id, share_method, is_visible, reaction_count, created_at, original_date, updated_at
  - Indexes: user, virtue, persona, type, feed, search (GIN)

- [ ] Create migration: `community_reactions` table
  - Columns: id, post_id, user_id, created_at
  - Unique constraint: (post_id, user_id)
  - Indexes: post_id, user_id

- [ ] Create migration: `community_reports` table
  - Columns: id, post_id, reporter_user_id, status, admin_notes, created_at, reviewed_at, reviewed_by
  - Indexes: status+created_at, post_id

- [ ] Update migration: Add columns to `profiles` table
  - `display_name VARCHAR(50) UNIQUE`
  - `community_enabled BOOLEAN DEFAULT false`
  - `community_onboarded_at TIMESTAMPTZ`

- [ ] Run migrations locally and test
- [ ] Update TypeScript types: `lib/supabase/types.ts`

**Acceptance Criteria**:
- All tables created successfully
- Indexes improve query performance (test with EXPLAIN)
- Types generated correctly
- No migration errors

---

### 1.2 Row Level Security (RLS) Policies [P]
**Time**: 4 hours
**Status**: ⏸️

**Tasks**:
- [ ] Create RLS policy: Users can view visible community posts
  - File: `supabase/migrations/YYYYMMDD_community_rls_policies.sql`
  - SELECT policy on `community_posts` WHERE `is_visible = true`

- [ ] Create RLS policy: Users can insert their own posts
  - INSERT policy WITH CHECK `auth.uid() = user_id`

- [ ] Create RLS policy: Users can delete their own posts
  - DELETE policy USING `auth.uid() = user_id`

- [ ] Create RLS policy: Users can react to visible posts
  - ALL policy on `community_reactions`
  - Check post exists and is_visible

- [ ] Create RLS policy: Users can report visible posts (not their own)
  - INSERT policy on `community_reports`
  - Check post is_visible and user_id != reporter

- [ ] Create RLS policy: Admins can manage reports
  - ALL policy on `community_reports`
  - Check user is_admin = true

- [ ] Test all policies with different user roles
- [ ] Document policies in migration file

**Acceptance Criteria**:
- RLS enabled on all community tables
- Policies prevent unauthorized access
- Admins can access moderation features
- Test queries respect policies

---

### 1.3 Content Formatters & Utilities
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `lib/community/formatters.ts`
  - `formatReflectionPost(reflection, user)` - Format reflection for sharing
  - `formatChatExcerpt(messages, user)` - Format selected chat messages
  - `formatChatSummary(summary, conversation, user)` - Format AI summary
  - `formatPracticeAchievement(practice, achievement, user)` - Format practice milestone

- [ ] Create `lib/community/validators.ts`
  - `validateDisplayName(name)` - 3-50 chars, alphanumeric + spaces/dashes/underscores
  - `isDisplayNameAvailable(name)` - Check uniqueness
  - `sanitizeContent(text)` - XSS prevention, basic sanitization

- [ ] Create `lib/community/types.ts`
  - TypeScript interfaces for all community data structures
  - `CommunityPost`, `SharePostData`, `FeedFilters`, etc.

- [ ] Write unit tests: `lib/community/__tests__/formatters.test.ts`
  - Test all formatter functions
  - Test edge cases (empty content, special chars)
  - Test sanitization

**Acceptance Criteria**:
- All formatters handle edge cases
- Validation prevents invalid data
- Sanitization blocks XSS attempts
- Unit tests >90% coverage

---

### 1.4 AI Summary Generation [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `lib/community/ai-summary.ts`
  - `generateChatSummary(conversationId, userId)` function
  - Fetch conversation messages
  - Build persona-specific prompt
  - Call `aiOrchestrator.complete()` with max 200 tokens
  - Return formatted summary

- [ ] Create summary prompt templates per persona
  - File: `lib/community/summary-prompts.ts`
  - One template per persona (Marcus, Lao Tzu, Simone, etc.)
  - Focus on extracting core wisdom, not personal details

- [ ] Add error handling for AI failures
  - Fallback to excerpt if summary fails
  - Log errors for monitoring

- [ ] Write unit tests with mocked AI responses

**Acceptance Criteria**:
- Summaries generated in persona voice
- Max 200 tokens, 2-3 sentences
- Handles API errors gracefully
- Persona-specific prompts working

---

### 1.5 User API Endpoints
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `app/api/community/opt-in/route.ts`
  - POST endpoint for community opt-in
  - Validate display_name, check uniqueness
  - Update profiles table
  - Return success + display_name

- [ ] Create `app/api/community/feed/route.ts`
  - GET endpoint for feed
  - Query params: mode, virtue, persona, content_type, limit, offset
  - Implement algorithmic ranking (matching virtue/persona/freshness)
  - Return paginated posts

- [ ] Create `app/api/community/search/route.ts`
  - GET endpoint for search
  - Full-text search using GIN index
  - Filter by virtue, persona, content_type, date range
  - Return results

- [ ] Create `app/api/community/posts/route.ts`
  - POST endpoint to share content
  - Validate source exists
  - Format content using formatters
  - Insert into community_posts
  - Return created post

- [ ] Create `app/api/community/posts/[postId]/route.ts`
  - DELETE endpoint to unshare (set is_visible=false)
  - Check user owns post
  - Return success

- [ ] Create `app/api/community/posts/[postId]/react/route.ts`
  - POST endpoint for reactions
  - Add or remove reaction
  - Update reaction_count
  - Return new count

- [ ] Create `app/api/community/posts/[postId]/report/route.ts`
  - POST endpoint to report post
  - Check user doesn't own post
  - Insert into community_reports
  - Return success

- [ ] Create `app/api/community/widget/route.ts`
  - GET endpoint for widget posts
  - Use ranking algorithm
  - Return 3-5 top posts

- [ ] Add middleware: Check community_enabled for all endpoints (except opt-in)
- [ ] Write integration tests for all endpoints

**Acceptance Criteria**:
- All 9 user endpoints working
- Proper auth checks
- Input validation
- Error handling
- Tests passing

---

### 1.6 Admin API Endpoints [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `app/api/admin/community/reports/route.ts`
  - GET endpoint for reports queue
  - Query params: status, limit, offset
  - Filter by status (pending, reviewed, dismissed, actioned)
  - Return paginated reports with post data

- [ ] Create `app/api/admin/community/reports/[reportId]/action/route.ts`
  - POST endpoint to take action
  - Actions: delete, hide, dismiss
  - Update report status
  - Update post (delete or set is_visible=false)
  - Log to admin_audit_log
  - Return success

- [ ] Add admin auth middleware check
- [ ] Write integration tests

**Acceptance Criteria**:
- Admin can view reports queue
- Admin can take actions (delete/hide/dismiss)
- Audit logging working
- Non-admins blocked

---

## Phase 2: Core UI Components (Week 2)
**Duration**: 5-7 days
**Status**: ⏸️ Not Started

### 2.1 Zustand Store [P]
**Time**: 4 hours
**Status**: ⏸️

**Tasks**:
- [ ] Create `lib/stores/community-store.ts`
  - State: isEnabled, displayName, feedPosts, feedMode, feedFilters, widgetPosts
  - Actions: enableCommunity, fetchFeed, fetchWidget, sharePost, reactToPost, reportPost, unsharePost, setFeedMode, setFeedFilters
  - Integrate with API endpoints
  - Add optimistic updates for reactions
  - Persist isEnabled and displayName

- [ ] Write tests: `lib/stores/__tests__/community-store.test.ts`

**Acceptance Criteria**:
- Store manages all community state
- API calls handled correctly
- Optimistic updates for UX
- Persistence working

---

### 2.2 Onboarding Modal [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `components/community/community-onboarding-modal.tsx`
  - Community guidelines text
  - Display name input with real-time validation
  - Uniqueness check (debounced)
  - Accept button (disabled until valid)
  - Use shadcn/ui Dialog component

- [ ] Add to Settings page toggle
  - File: `components/settings/settings-preferences.tsx`
  - Toggle for "Enable Community"
  - Opens modal when toggled ON

- [ ] Style with Tailwind
- [ ] Add accessibility (ARIA labels, keyboard nav)

**Acceptance Criteria**:
- Modal shows guidelines clearly
- Display name validation works
- Can't proceed with taken name
- Accessible via keyboard

---

### 2.3 Community Feed Page [P]
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `app/(dashboard)/community/page.tsx`
  - Main community page route
  - Tab switcher: "For You" / "Recent"
  - Filter bar with dropdowns (virtue, persona, content_type)
  - Infinite scroll using `react-intersection-observer`
  - Empty states (no posts, filters active, etc.)

- [ ] Create `components/community/community-feed.tsx`
  - Feed container component
  - Fetches posts from store
  - Renders post cards
  - Loading skeleton
  - Error boundary

- [ ] Create `components/community/community-post-card.tsx`
  - Dynamic rendering based on content_type
  - Reflection layout (virtue tag, reflection type, content)
  - Chat layout (persona badge, excerpt/summary indicator)
  - Practice layout (achievement type, streak info)
  - Reaction button with count
  - Report button (flag icon)
  - Timestamp (relative: "2 hours ago")

- [ ] Create `components/community/community-feed-filters.tsx`
  - Dropdowns for virtue, persona, content_type
  - Clear filters button
  - Active filter indicators

- [ ] Add to main navigation
  - File: `components/shared/app-sidebar.tsx`
  - Add "Community" link (only show if enabled)

- [ ] Style with persona theming
- [ ] Responsive mobile layout

**Acceptance Criteria**:
- Feed displays posts correctly
- Tabs switch between algorithmic/chronological
- Filters work properly
- Infinite scroll loads more
- Mobile responsive

---

### 2.4 Share Functionality [P]
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `components/community/share-to-community-button.tsx`
  - Button component for sharing
  - Opens share preview modal
  - Passes content data

- [ ] Create `components/community/share-preview-modal.tsx`
  - Shows preview of how post will appear
  - For chats: Method selector (excerpt vs AI summary)
  - If excerpt: Highlight messages to include
  - If AI summary: Generate and show summary
  - Confirm/Cancel buttons
  - Loading state while generating summary

- [ ] Add to `components/reflections/reflection-composer.tsx`
  - Add "Share with Community" button after save success
  - Only show if community_enabled

- [ ] Add to `components/marcus/coach-workspace.tsx`
  - Add "Share" icon in message actions menu
  - Click opens share preview modal
  - Pre-select the message for excerpt

- [ ] Add to practice completion flow
  - File: `components/practices/practice-quick-actions.tsx` or similar
  - Show "Share achievement" after milestone
  - Format practice achievement data

- [ ] Write component tests

**Acceptance Criteria**:
- Can share from all 3 content types
- Preview shows accurate post layout
- AI summary generates correctly
- Excerpt selection works
- Confirmation creates post

---

## Phase 3: Search & Discovery (Week 3)
**Duration**: 5-6 days
**Status**: ⏸️ Not Started

### 3.1 Search Interface [P]
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `components/community/community-search-bar.tsx`
  - Search input with icon
  - Real-time search suggestions (debounced)
  - Filter panel (collapsible)
    - Virtue dropdown
    - Persona dropdown
    - Content type dropdown
    - Date range picker
  - Clear all filters button
  - Search button

- [ ] Create `components/community/community-search-results.tsx`
  - Results list using same post card component
  - Result count display
  - Empty state ("No results found")
  - Highlighting search terms in results

- [ ] Add to community page
  - Search bar at top
  - Results replace feed when searching
  - Can toggle back to feed

- [ ] Implement search API integration
  - Call `/api/community/search` with query + filters
  - Handle pagination
  - Update store

**Acceptance Criteria**:
- Full-text search works
- All filters apply correctly
- Results highlight search terms
- Fast response (<500ms)
- Mobile responsive

---

### 3.2 Feed Ranking Algorithm [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `lib/community/scoring.ts`
  - `calculatePostScore(post, user)` function
  - Weighted scoring:
    - Matching virtue: 50%
    - Matching persona: 30%
    - Freshness: 20% (decay over 7 days)
  - `sortFeedPosts(posts, user)` - Sort by score

- [ ] Update feed API endpoint
  - File: `app/api/community/feed/route.ts`
  - Apply scoring algorithm when mode="for_you"
  - Return sorted posts

- [ ] Add A/B test infrastructure (future)
  - Allow tweaking weights
  - Track engagement by scoring variant

- [ ] Write unit tests

**Acceptance Criteria**:
- Algorithm returns personalized posts
- Matching virtue/persona prioritized
- Fresh content surfaces
- Can tune weights easily

---

### 3.3 Widget Implementation [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Create `components/community/community-widget-carousel.tsx`
  - Swipeable carousel (use `react-swipeable` or similar)
  - Shows 3-5 posts in compact format
  - Compact post card variant (smaller, key info only)
  - "View All" link to Community page
  - Auto-advance timer (optional)

- [ ] Update widget API endpoint
  - File: `app/api/community/widget/route.ts`
  - Use scoring algorithm
  - Return top 3-5 posts for user

- [ ] Add to Today page
  - File: `app/(dashboard)/today/page.tsx` or `client.tsx`
  - Add widget section (if community_enabled)
  - Position below existing widgets

- [ ] Track widget analytics
  - Widget impressions
  - Post clicks from widget
  - "View All" clicks

**Acceptance Criteria**:
- Widget shows personalized posts
- Swipeable on mobile
- Compact layout fits Today page
- Analytics tracking working
- Links to full community page

---

### 3.4 Engagement Features [P]
**Time**: 1-2 days
**Status**: ⏸️

**Tasks**:
- [ ] Implement reaction UI/UX
  - Heart icon button on post cards
  - Fill/unfill animation
  - Update count optimistically
  - API call to `/api/community/posts/:id/react`
  - Handle errors (revert optimistic update)

- [ ] Implement reporting UI
  - Report button (flag icon)
  - Confirmation dialog: "Report this post?"
  - Success toast: "Report submitted"
  - API call to `/api/community/posts/:id/report`

- [ ] Implement unsharing (delete own post)
  - Three-dot menu on own posts
  - "Remove from community" option
  - Confirmation dialog
  - API call to DELETE `/api/community/posts/:id`
  - Remove from feed UI

- [ ] Add reaction animation
  - Heart pop animation
  - Micro-interaction feedback

**Acceptance Criteria**:
- Can react to posts
- Optimistic updates smooth
- Report flow works
- Can unshare own posts
- Animations polished

---

## Phase 4: Moderation & Polish (Week 4)
**Duration**: 5-7 days
**Status**: ⏸️ Not Started

### 4.1 Admin Moderation UI [P]
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `components/admin/community-reports-queue.tsx`
  - List of reported posts
  - Show: post content, reporter (anonymized), timestamp, status
  - Filter by status (pending, reviewed, dismissed, actioned)
  - Action buttons: Delete, Hide, Dismiss
  - Admin notes textarea
  - Pagination

- [ ] Create `components/admin/community-report-card.tsx`
  - Single report item
  - Expandable post preview
  - Action buttons with confirmation dialogs
  - Status indicator

- [ ] Add to Admin Dashboard
  - File: `app/admin/community/page.tsx` (new page)
  - Or add as tab to existing admin pages
  - Admin navigation link

- [ ] Integrate with admin API
  - Fetch reports: GET `/api/admin/community/reports`
  - Take action: POST `/api/admin/community/reports/:id/action`

- [ ] Add admin notifications
  - Badge on nav item showing pending report count

**Acceptance Criteria**:
- Admin can view all reports
- Can filter by status
- Actions work (delete/hide/dismiss)
- Audit logging happens
- Mobile responsive

---

### 4.2 Analytics Implementation [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Add PostHog events
  - File: `lib/analytics/events.ts` (extend existing)
  - `community_opted_in(display_name)`
  - `community_post_shared(content_type, share_method, virtue, persona)`
  - `community_post_viewed(post_id, content_type)`
  - `community_post_reacted(post_id)`
  - `community_post_unshared(post_id)`
  - `community_post_reported(post_id)`
  - `community_feed_filtered(filters)`
  - `community_searched(query, results_count)`
  - `community_report_actioned(action, post_id)` (admin)

- [ ] Instrument all user actions
  - Add event calls to components
  - Track widget interactions
  - Track feed scrolling depth

- [ ] Create PostHog dashboard
  - Community health metrics
  - Engagement funnel
  - Moderation metrics

**Acceptance Criteria**:
- All events firing correctly
- PostHog dashboard showing data
- Can track adoption and engagement
- Admin actions logged

---

### 4.3 E2E Tests [P]
**Time**: 2 days
**Status**: ⏸️

**Tasks**:
- [ ] Create `e2e/specs/community.spec.ts`
  - **Test 1**: User opts in to community
    - Go to settings
    - Enable community toggle
    - See onboarding modal
    - Choose display name
    - Accept guidelines
    - Community page accessible

  - **Test 2**: User shares reflection
    - Complete morning reflection
    - Click "Share with Community"
    - See preview
    - Confirm share
    - See post in community feed

  - **Test 3**: User shares chat excerpt
    - Have conversation with Marcus
    - Click "Share" on message
    - Select "Excerpt" method
    - Highlight messages
    - Confirm share
    - See post in feed

  - **Test 4**: User shares AI summary
    - Have conversation with Lao Tzu
    - Click "Share" on conversation
    - Select "AI Summary" method
    - Wait for summary generation
    - Confirm share
    - See summary in feed

  - **Test 5**: User browses and filters feed
    - Go to community page
    - Switch to "Recent" tab
    - Apply virtue filter (Wisdom)
    - Apply persona filter (Marcus)
    - See filtered results

  - **Test 6**: User searches community
    - Enter search query
    - Apply date filter
    - See results
    - Click result to view

  - **Test 7**: User reacts to post
    - View community feed
    - Click heart on a post
    - See count increment
    - Click again to unreact
    - See count decrement

  - **Test 8**: User reports post
    - View post
    - Click report button
    - Confirm report
    - See success message

  - **Test 9**: User unshares own post
    - View own post in feed
    - Click menu
    - Select "Remove from community"
    - Confirm
    - Post removed from feed

  - **Test 10**: Widget on Today page
    - Enable community
    - Go to Today page
    - See Community Wisdom widget
    - Swipe through posts
    - Click "View All"
    - Go to community page

  - **Test 11**: Admin moderates content
    - User reports a post
    - Login as admin
    - Go to reports queue
    - See reported post
    - Click "Hide"
    - Post hidden from feed

- [ ] Run tests locally
- [ ] Fix any failures
- [ ] Add to CI pipeline

**Acceptance Criteria**:
- All 11 E2E tests passing
- Cover full user journey
- Admin flow tested
- Can run in CI

---

### 4.4 Performance Optimization [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Optimize database queries
  - Add EXPLAIN ANALYZE to slow queries
  - Ensure indexes used correctly
  - Consider materialized views for widget

- [ ] Implement caching
  - Cache widget posts (5 min TTL)
  - Cache feed for short period
  - Use React Query stale-while-revalidate

- [ ] Image optimization (if posts have images in future)
  - Use Next.js Image component
  - Lazy load images

- [ ] Bundle size optimization
  - Code split community routes
  - Lazy load modal components

- [ ] Test with large datasets
  - Seed 10,000+ posts
  - Test feed performance
  - Test search performance
  - Ensure <500ms p95 response times

**Acceptance Criteria**:
- Feed loads <500ms (p95)
- Search responds <300ms (p95)
- Widget loads <200ms (p95)
- No memory leaks
- Smooth scrolling on mobile

---

### 4.5 Documentation & Launch Prep [P]
**Time**: 1 day
**Status**: ⏸️

**Tasks**:
- [ ] Write user documentation
  - File: `docs/user-guides/community-guide.md`
  - How to opt-in
  - How to share content
  - How to use search/filters
  - Community guidelines

- [ ] Write admin documentation
  - File: `docs/admin-guides/community-moderation.md`
  - How to review reports
  - When to delete vs hide
  - Best practices

- [ ] Update API documentation
  - Document all endpoints in `docs/api/community.md`
  - Request/response examples
  - Error codes

- [ ] Create launch checklist
  - Database migrations run
  - Feature flag ready (if using)
  - Analytics dashboard set up
  - Support team trained
  - Social media announcement prepared

- [ ] Final QA pass
  - Test on all browsers
  - Test on mobile devices
  - Test edge cases
  - Load testing

**Acceptance Criteria**:
- Documentation complete
- Launch checklist items done
- QA sign-off received
- Ready for production deploy

---

## Post-Launch Tasks (Week 5+)
**Status**: ⏸️ Future

### 5.1 Monitoring & Iteration
**Time**: Ongoing
**Status**: ⏸️

**Tasks**:
- [ ] Monitor adoption metrics daily
  - Opt-in rate
  - Posts shared per day
  - Reactions per post
  - Report rate

- [ ] Watch for issues
  - Slow queries
  - High report volume
  - User complaints

- [ ] Iterate on algorithm
  - A/B test different scoring weights
  - Tune based on engagement data

- [ ] Collect user feedback
  - In-app surveys
  - Support tickets analysis

**Acceptance Criteria**:
- Metrics dashboard reviewed daily
- Issues triaged within 24 hours
- Algorithm improvements deployed monthly
- User feedback incorporated

---

### 5.2 Quick Wins & Improvements
**Time**: 1-2 weeks
**Status**: ⏸️

**Tasks**:
- [ ] Add "New" badge on widget posts user hasn't seen
- [ ] Add "Trending" indicator on popular posts
- [ ] Improve empty states with illustrations
- [ ] Add dark mode support for all community UI
- [ ] Add keyboard shortcuts (j/k navigation, etc.)
- [ ] Optimize for PWA/offline (cache recent posts)

**Acceptance Criteria**:
- Quick wins improve UX
- No regressions
- Analytics show improvement

---

## Success Metrics Tracking

### 30-Day Post-Launch Goals
- [ ] 30% of active users opt-in to community
- [ ] 10% of community users share content monthly
- [ ] <2% content report rate
- [ ] 15% increase in 30-day retention for participants
- [ ] Average 3+ posts viewed per session

### 90-Day Goals
- [ ] 50% opt-in rate
- [ ] 20% monthly sharing rate
- [ ] <1% report rate
- [ ] 25% retention lift
- [ ] Build library of 10,000+ community posts

---

## Dependencies

**Blocking Dependencies**:
- Admin dashboard infrastructure (exists ✅)
- PostHog analytics (exists ✅)
- AI orchestrator (exists ✅)
- Supabase database (exists ✅)

**Non-Blocking**:
- Comments system (v2 feature)
- Resharing (v2 feature)
- Engagement ranking (v2 feature)

---

## Risk Mitigation

**Risk 1**: Low adoption
- **Mitigation**: Prominent onboarding prompts, widget on Today page, show value prop

**Risk 2**: Toxic content/spam
- **Mitigation**: Simple reporting, responsive admin moderation, AI filtering (v2)

**Risk 3**: Performance issues at scale
- **Mitigation**: Proper indexing, caching, load testing before launch

**Risk 4**: Privacy concerns
- **Mitigation**: Opt-in by default, clear guidelines, pseudonymous identity

**Risk 5**: Display name conflicts
- **Mitigation**: Unique constraint enforced, helpful error messages

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Database & Backend** | 5-7 days | DB schema, RLS, API endpoints, formatters, AI summary |
| **Phase 2: Core UI** | 5-7 days | Onboarding, feed page, post cards, share modals, store |
| **Phase 3: Search & Discovery** | 5-6 days | Search interface, ranking algorithm, widget, reactions |
| **Phase 4: Moderation & Polish** | 5-7 days | Admin UI, analytics, E2E tests, performance, docs |
| **Total** | **3-4 weeks** | **Fully functional community v1** |

---

**Document Status**: Ready for Implementation
**Next Steps**: Begin Phase 1 → Database & Backend Infrastructure
