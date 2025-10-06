# Community Features - Planning Summary

**Date**: October 4, 2025
**Status**: Specification Complete, Ready for Implementation
**Estimated Duration**: 3-4 weeks

---

## Overview

Successfully designed a comprehensive community features system that enables users to share wisdom and insights from their philosophical practice while maintaining privacy and intentionality.

### What We Built (Documentation)

1. **Feature Specification**: [community-features.md](build-plan/community-features.md) - 50+ page comprehensive spec
2. **Task Breakdown**: [tasks/community-features/tasks.md](build-plan/tasks/community-features/tasks.md) - Detailed 4-phase implementation plan
3. **Updated Master Docs**: README files updated with community feature references

---

## Core Feature Set (v1)

### User Experience

**Opt-In Philosophy**:
- Community is OFF by default
- Users must explicitly enable in Settings
- Onboarding shows guidelines + display name selection
- Pseudonymous identity (unique username)

**Content Sharing**:
Users can share 3 types of content:
1. **Reflections** - Morning/midday/evening reflections
2. **AI Coach Conversations** - Via two methods:
   - User-selected excerpt (highlight specific messages)
   - AI-generated summary (coach creates summary in their voice)
3. **Practice Achievements** - Milestones, streaks, breakthroughs

**Discovery & Browsing**:
- **Community Page** - Full browsing experience with tabs:
  - "For You" - Algorithmic feed (virtue + persona + freshness)
  - "Recent" - Chronological feed
- **Widget on Today Page** - Scrollable carousel of 3-5 curated posts
- **Search** - Full-text search with filters:
  - Keywords, Virtue, Persona, Content Type, Date Range

**Engagement**:
- Simple reactions (heart/"resonates" icon)
- Public reaction counts
- User reporting (flag button)
- Ability to unshare own posts

**Moderation**:
- User reporting system
- Admin review queue with actions:
  - Delete (remove completely)
  - Hide (keep for records, remove from feed)
  - Dismiss (false alarm)
- Admin oversight and audit logging

---

## Technical Architecture

### Database Schema

**3 New Tables**:
1. **`community_posts`** - Denormalized post data
   - Includes: content, metadata, author info, visibility
   - Indexes: user, virtue, persona, type, feed, full-text search
   - Supports all 3 content types with flexible metadata

2. **`community_reactions`** - User reactions
   - One reaction per user per post
   - Updates post reaction_count

3. **`community_reports`** - Content reports
   - Track status (pending, reviewed, dismissed, actioned)
   - Admin notes and review timestamps

**Profile Updates**:
- `display_name` - Unique username (3-50 chars)
- `community_enabled` - Opt-in flag
- `community_onboarded_at` - Tracking

### API Endpoints

**9 User Endpoints**:
- `POST /api/community/opt-in` - Enable + set display name
- `GET /api/community/feed` - Get feed (algorithmic or chronological)
- `GET /api/community/search` - Full-text search with filters
- `POST /api/community/posts` - Share content
- `DELETE /api/community/posts/:id` - Unshare
- `POST /api/community/posts/:id/react` - Add/remove reaction
- `POST /api/community/posts/:id/report` - Report content
- `GET /api/community/widget` - Get widget posts

**2 Admin Endpoints**:
- `GET /api/admin/community/reports` - Reports queue
- `POST /api/admin/community/reports/:id/action` - Take action

### AI Integration

**Chat Summary Generation**:
- Persona-specific prompts (Marcus, Lao Tzu, Simone, etc.)
- Uses existing `aiOrchestrator.complete()`
- Max 200 tokens, 2-3 sentences
- Captures core wisdom in persona's voice

**Feed Algorithm**:
- Weighted scoring:
  - 50% - Matching virtue
  - 30% - Matching persona
  - 20% - Freshness (decay over 7 days)
- Personalizes "For You" feed per user

---

## UI Components

### New Components (11)
1. `<CommunityOnboardingModal />` - Guidelines + display name picker
2. `<CommunityFeed />` - Main feed with tabs and infinite scroll
3. `<CommunityPostCard />` - Dynamic card (adapts to content type)
4. `<CommunityWidgetCarousel />` - Swipeable widget for Today page
5. `<ShareToCommunityButton />` - Appears after saving content
6. `<SharePreviewModal />` - Preview + method selector
7. `<CommunitySearchBar />` - Search with filter panel
8. `<CommunityFeedFilters />` - Virtue/persona/type filters
9. `<AdminReportsQueue />` - Moderation interface
10. `<CommunityPostMenu />` - Actions (unshare, report)
11. `<CommunityReactionButton />` - Heart with animation

### Updated Components (6)
- Settings page (community toggle)
- Today page (widget integration)
- Main navigation (community link)
- Reflection composer (share button)
- Coach workspace (share message)
- Admin dashboard (reports tab)

---

## Security & Privacy

### Row Level Security
- Users can only view visible posts
- Users can only delete their own posts
- Users can't report their own posts
- Admins can manage all reports

### Privacy Features
- **Pseudonymous** - Unique display names, no real identity
- **Opt-in** - Community OFF by default
- **Denormalized** - Shared posts are snapshots, originals stay private
- **Unsharing** - Removes from feed but keeps for moderation
- **No following** - No user-to-user connections (v1)

### Content Safety
- Input validation and XSS prevention
- Display name uniqueness enforced
- User reporting system
- Admin moderation queue
- Audit logging of all actions

---

## Analytics & Success Metrics

### Events Tracked (11)
- `community_opted_in`
- `community_post_shared`
- `community_post_viewed`
- `community_post_reacted`
- `community_post_unshared`
- `community_post_reported`
- `community_feed_filtered`
- `community_searched`
- `community_widget_clicked`
- `community_widget_viewed`
- `community_report_actioned` (admin)

### 30-Day Success Metrics
- 30% opt-in rate
- 10% monthly sharing rate
- <2% content report rate
- 15% retention lift for participants
- Average 3+ posts viewed per session

---

## Implementation Plan

### Phase 1: Database & Backend (Week 1)
**Duration**: 5-7 days

**Deliverables**:
- Database migrations (3 tables + profile updates)
- RLS policies (6 policies)
- Content formatters and validators
- AI summary generation
- 9 user API endpoints
- 2 admin API endpoints
- Unit + integration tests

---

### Phase 2: Core UI Components (Week 2)
**Duration**: 5-7 days

**Deliverables**:
- Zustand community store
- Onboarding modal
- Community feed page
- Post card component (3 variants)
- Share functionality (3 content types)
- Settings integration
- Main navigation link

---

### Phase 3: Search & Discovery (Week 3)
**Duration**: 5-6 days

**Deliverables**:
- Search interface with filters
- Feed ranking algorithm
- Widget for Today page
- Engagement features (react, report, unshare)
- Optimistic UI updates
- Animations and micro-interactions

---

### Phase 4: Moderation & Polish (Week 4)
**Duration**: 5-7 days

**Deliverables**:
- Admin moderation UI
- Reports queue and actions
- Analytics instrumentation (11 events)
- E2E tests (11 test cases)
- Performance optimization
- Documentation (user, admin, API)
- Launch prep and QA

---

## Future Enhancements (v2+)

### Discussed for Later
- **Comments system** - Threaded discussions
- **Resharing** - Quote-share with commentary
- **Engagement ranking** - Surface trending content
- **AI content filtering** - Automated moderation

### Additional Ideas
- Opt-in groups (private circles)
- Following system
- Notifications
- Wisdom collections
- Voice of the week
- Community challenges
- Premium community features

---

## Design Decisions Made

### Content Sharing
- ✅ Users choose between excerpt or AI summary for chats
- ✅ AI summaries generated in persona voice
- ✅ All content types: reflections, chats, practices

### Identity & Privacy
- ✅ User-chosen display names (unique)
- ✅ Virtue and persona context visible
- ✅ Pseudonymous (no real identity)
- ✅ Opt-in by default

### Discovery
- ✅ Algorithmic feed prioritizes matching virtue + persona + freshness
- ✅ Comprehensive search (keywords, filters, date range)
- ✅ Widget on Today page for discovery
- ❌ No engagement/popularity ranking in v1 (later)

### Engagement
- ✅ Simple universal reaction (heart)
- ✅ Public reaction counts
- ❌ No comments in v1
- ❌ No resharing in v1

### Moderation
- ✅ Simple user reporting (flag button)
- ✅ Admin review queue with 3 actions
- ✅ Admin oversight and audit logging
- ❌ No AI-powered filtering in v1

### Architecture
- ✅ Hybrid database approach (denormalized community_posts)
- ✅ Unique display names
- ✅ Unsharing keeps records for moderation
- ✅ RLS policies for security

---

## Key Files Created

### Documentation
1. **[community-features.md](build-plan/community-features.md)** - Complete 50+ page specification
   - Overview and business value
   - UX flows and wireframes
   - Technical architecture
   - Database schema
   - API design (11 endpoints)
   - UI components (11 new, 6 updated)
   - Security and privacy
   - Analytics and metrics
   - Testing strategy
   - Deployment plan
   - Future enhancements

2. **[tasks/community-features/tasks.md](build-plan/tasks/community-features/tasks.md)** - Detailed task breakdown
   - 4 phases with 20+ task groups
   - Time estimates per task
   - Acceptance criteria
   - Dependencies
   - Parallelization markers [P]
   - Risk mitigation
   - Timeline summary (3-4 weeks)

3. **Master docs updated**:
   - [build-plan/README.md](build-plan/README.md) - Added community features
   - [tasks/README.md](build-plan/tasks/README.md) - Added step 15

---

## Requirements Gathering Process

We collaboratively designed this feature through 20 questions, exploring:

1. **Core concept** - Wisdom sharing, chat insights, community value
2. **Privacy philosophy** - Pseudonymous, opt-in approach
3. **Scope** - Viewing and sharing (no comments/resharing v1)
4. **Content types** - Reflections, chats, practices
5. **Discovery** - Algorithmic feed + search
6. **Engagement** - Reactions, reporting, unsharing
7. **Moderation** - User reports + admin oversight
8. **Monetization** - Free for now
9. **Chat sharing** - User excerpt OR AI summary
10. **Identity** - User-chosen names + virtue/persona context
11. **Feed algorithm** - Virtue + persona + freshness
12. **Search filters** - All filters (keywords, virtue, persona, type, date)
13. **Reactions** - Simple/universal (one type)
14. **Visibility** - Public counts
15. **Comments** - Not in v1
16. **Resharing** - Not in v1
17. **Reporting** - Simple flag button
18. **Database** - Hybrid denormalized approach
19. **Display names** - Unique usernames
20. **Deletion** - Unshare keeps for moderation
21. **Feed access** - Opt-in only
22. **Content types** - A, B, C (no custom posts)
23. **AI summaries** - Coach-specific voice
24. **Metadata** - Custom per content type
25. **Navigation** - Top-level page + Today widget
26. **Widget** - Scrollable carousel (3-5 posts)
27. **Moderation tools** - Basic review queue with actions
28. **Onboarding** - Guidelines + display name setup

---

## Business Value

### Engagement
- Increase daily active users through community interaction
- Build social connections that encourage continued practice
- Widget on Today page drives discovery

### Retention
- 15% target increase in 30-day retention for community participants
- Network effects: more users → more wisdom → more value

### Virality
- Shared wisdom can attract new users organically
- Pseudonymous sharing reduces friction

### Monetization (Future)
- Foundation for premium community features
- Potential for community-exclusive content
- Group challenges tied to subscriptions

---

## Next Steps (Updated)

### Immediate
- ✅ Feature spec complete
- ✅ Task breakdown complete
- ✅ Master docs updated
- ✅ Community page, nav, settings integration, and Today widget verified
- 🔧 Apply minor fixes (see below)

### Fixes To Apply Now
- Normalize community `content_type` across UI/store and DB:
  - `chat_excerpt`/`chat_summary` → `chat`, `practice_achievement` → `practice`
- Correct profiles key usage in admin endpoints and scoring (`user_id` vs `id`)
- Update feed filters to DB types (`chat`, `practice`)

### Short-Term (UI/UX)
- Wire search input to `/api/community/search`
- Optional: swap “Load More” for infinite scroll
- Optional: convert widget to carousel

### Week 3 (Phase 3)
- Implement search
- Build widget
- Add ranking algorithm
- Engagement features

### Admin + QA
- Build admin moderation UI
- Add analytics events for opt-in/share/react/report
- Add unit/integration/E2E tests for community flows

---

## Open Questions for Review

1. **Display name changes**: Should users be able to change display name? How often?
2. **AI summary cost**: Monitor OpenAI API costs for summary generation at scale
3. **Content licensing**: Do we need terms for shared content ownership?
4. **Internationalization**: How do we handle non-English content in search/moderation?
5. **Reaction limits**: Should there be a cooldown or limit on reactions?
6. **Feed personalization**: Exact weights for virtue vs persona vs freshness? A/B test?

---

## Success Criteria

**Launch Readiness**:
- [ ] All 11 endpoints deployed and tested
- [ ] Feed algorithm tuned and performant (<500ms p95)
- [ ] Moderation queue functional for admins
- [ ] E2E tests passing (11 test cases)
- [ ] Analytics events firing correctly
- [ ] RLS policies secure
- [ ] Documentation complete

**30-Day Post-Launch**:
- [ ] 30% opt-in rate achieved
- [ ] <2% content report rate maintained
- [ ] 10% of community users sharing monthly
- [ ] 15% retention lift for participants
- [ ] <1% false positive moderation rate

---

## Summary Statistics

### Documentation Created
- **Files**: 3 (spec, tasks, summary)
- **Pages**: ~100 pages total
- **Time spent**: ~2-3 hours of collaborative design

### Feature Scope
- **New tables**: 3
- **API endpoints**: 11 (9 user, 2 admin)
- **New components**: 11
- **Updated components**: 6
- **Analytics events**: 11
- **E2E tests**: 11
- **Implementation time**: 3-4 weeks

### Questions Asked
- **Total questions**: 20
- **Coverage**: UX, privacy, tech, moderation, monetization
- **Decisions made**: 28+

---

**Created by**: Claude Agent (collaborative design with user)
**Date**: October 4, 2025
**Status**: Ready for Team Review
**Next Action**: Schedule review meeting → Approve → Begin Phase 1
