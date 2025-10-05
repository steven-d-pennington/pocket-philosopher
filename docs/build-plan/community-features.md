# Community Features - Feature Specification

**Version**: 1.0
**Status**: Planning
**Created**: October 4, 2025
**Owner**: Product Team

---

## Overview

Enable users to share meaningful insights, reflections, and wisdom from their philosophical practice with a pseudonymous, opt-in community. This feature transforms Pocket Philosopher from a solo practice tool into a wisdom-sharing platform while maintaining privacy and intentionality.

### Business Value

- **Engagement**: Increase daily active users through community interaction
- **Retention**: Build social connections that encourage continued practice
- **Virality**: Shared wisdom can attract new users organically
- **Premium value**: Create foundation for future premium community features
- **Network effects**: More users → more wisdom → more value → more users

### Success Metrics

- **Adoption**: 30% of active users opt-in to community within 30 days
- **Engagement**: Average 3+ posts viewed per session for community users
- **Sharing**: 10% of community users share content monthly
- **Retention**: 15% increase in 30-day retention for community participants
- **Quality**: <2% content report rate (indicates healthy community)

---

## User Experience

### Community Opt-In Flow

1. User navigates to Settings
2. Sees "Community" toggle (default: OFF)
3. Clicks to enable
4. **Onboarding modal appears**:
   - Community guidelines (respect, wisdom-sharing, kindness)
   - Choose unique display name (validates uniqueness)
   - Virtue/persona visibility explained
   - Accept and enter community

5. Community unlocks:
   - "Community" appears in main navigation
   - "Community Wisdom" widget appears on Today page

### Sharing Flow

#### Option 1: Share Reflection

1. User completes a reflection (morning/midday/evening)
2. After saving, sees "Share with Community" button
3. Clicks to review:
   - Preview of how it will appear
   - Shows: Display name, Virtue, Reflection type, Content, Date
   - Toggle: "Include virtue focus" (default: ON)
4. Confirms → Post appears in community feed

#### Option 2: Share Coach Conversation

1. During/after chat with AI coach
2. User selects "Share this wisdom"
3. Choose sharing method:
   - **User-selected excerpt**: Highlight specific messages to share
   - **AI-generated summary**: Coach creates summary in their voice
4. Preview shows:
   - Display name, Virtue, Persona used
   - Content (excerpt or summary)
   - Indicator: "Excerpt" or "AI Summary"
5. Confirms → Post appears in community feed

#### Option 3: Share Practice Achievement

1. User completes practice or reaches milestone
2. Sees "Share achievement" option
3. System formats post with:
   - Practice name
   - Achievement type (milestone, streak, breakthrough)
   - Optional personal note from user
4. Preview shows:
   - Display name, Virtue
   - Practice name + achievement
   - Streak info if relevant
5. Confirms → Post appears in community feed

### Browsing Community Feed

#### Main Community Page

**Layout**:
- Header: "Community" with search icon
- Tabs: "For You" (algorithmic) | "Recent" (chronological)
- Filter bar: Virtue, Persona, Content Type dropdowns
- Infinite scroll feed of posts

**Post Card Design** (varies by type):

**Reflection Post**:
```
┌─────────────────────────────────────┐
│ 🧘 Phoenix • Wisdom • Morning       │
│    2 hours ago                      │
├─────────────────────────────────────┤
│ "Today I'm focusing on being fully  │
│  present in each conversation..."   │
│                                     │
│ [Virtue: Wisdom] [Morning]          │
├─────────────────────────────────────┤
│ ❤️ 24 resonated   🚩 Report         │
└─────────────────────────────────────┘
```

**Chat Excerpt Post**:
```
┌─────────────────────────────────────┐
│ 🎭 Marcus Fan • Justice • Marcus    │
│    5 hours ago                      │
├─────────────────────────────────────┤
│ 💬 Chat excerpt with Marcus Aurelius│
│                                     │
│ "Consider that what is hindering    │
│  you is not the situation itself... │
│                                     │
│ [Excerpt] [Marcus Aurelius]         │
├─────────────────────────────────────┤
│ ❤️ 42 resonated   🚩 Report         │
└─────────────────────────────────────┘
```

**Practice Achievement Post**:
```
┌─────────────────────────────────────┐
│ 🔥 Seeker • Courage                 │
│    1 day ago                        │
├─────────────────────────────────────┤
│ 🎯 Milestone: 30-day streak!        │
│ Practice: Morning Meditation        │
│                                     │
│ "Finally feeling the consistency... │
│                                     │
│ [30-day streak] [Morning Meditation]│
├─────────────────────────────────────┤
│ ❤️ 67 resonated   🚩 Report         │
└─────────────────────────────────────┘
```

#### Today Page Widget

**Community Wisdom Carousel**:
```
┌─────────────────────────────────────┐
│ 🌟 Community Wisdom                 │
│                         [View All →]│
├─────────────────────────────────────┤
│  ← [Post 1] [Post 2] [Post 3] →    │
│                                     │
│  • Swipeable carousel               │
│  • 3-5 algorithmically selected     │
│  • Compact card format              │
└─────────────────────────────────────┘
```

### Search & Discovery

**Search Interface**:
- Search bar at top of Community page
- Real-time suggestions as user types
- Filter panel:
  - **Keywords**: Full-text search
  - **Virtue**: Wisdom, Justice, Courage, Temperance, Compassion, Resilience
  - **Persona**: Marcus, Lao Tzu, Simone, Buddha, Rumi, Epictetus
  - **Content Type**: Reflections, Chats, Practices
  - **Date Range**: Today, This Week, This Month, All Time

**Algorithmic Feed ("For You")**:

Ranking signals (in priority order):
1. **Matching virtue** (50% weight) - Same virtue focus as user
2. **Matching persona** (30% weight) - Same active coach
3. **Freshness** (20% weight) - Recent posts prioritized

Future: Add engagement/popularity signals

---

## Technical Architecture

### Database Schema

#### New Table: `community_posts`

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Author info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL, -- Denormalized for performance

  -- Content
  content_type VARCHAR(20) NOT NULL, -- 'reflection', 'chat', 'practice'
  content_text TEXT NOT NULL, -- Denormalized content
  content_metadata JSONB NOT NULL, -- Type-specific data

  -- Source references
  source_id UUID, -- ID of original reflection/message/practice
  source_table VARCHAR(50), -- 'reflections', 'marcus_messages', 'habit_logs'

  -- Context
  virtue VARCHAR(50), -- User's virtue focus at time of share
  persona_id VARCHAR(50), -- Active persona if relevant

  -- Sharing method (for chats)
  share_method VARCHAR(20), -- 'excerpt', 'ai_summary', null

  -- Visibility
  is_visible BOOLEAN DEFAULT true, -- False if unshared/hidden

  -- Engagement
  reaction_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  original_date DATE, -- Date of original content (reflection/chat date)
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_community_posts_user ON community_posts (user_id, is_visible) WHERE is_visible = true;
CREATE INDEX idx_community_posts_virtue ON community_posts (virtue, created_at DESC) WHERE is_visible = true;
CREATE INDEX idx_community_posts_persona ON community_posts (persona_id, created_at DESC) WHERE is_visible = true;
CREATE INDEX idx_community_posts_type ON community_posts (content_type, created_at DESC) WHERE is_visible = true;
CREATE INDEX idx_community_posts_feed ON community_posts (is_visible, created_at DESC) WHERE is_visible = true;
CREATE INDEX idx_community_posts_search ON community_posts USING gin(to_tsvector('english', content_text)) WHERE is_visible = true;
```

#### Table: `community_reactions`

```sql
CREATE TABLE community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(post_id, user_id) -- One reaction per user per post
);

CREATE INDEX idx_community_reactions_post ON community_reactions (post_id);
CREATE INDEX idx_community_reactions_user ON community_reactions (user_id);
```

#### Table: `community_reports`

```sql
CREATE TABLE community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_community_reports_status ON community_reports (status, created_at DESC);
CREATE INDEX idx_community_reports_post ON community_reports (post_id);
```

#### Update: `profiles` table

```sql
ALTER TABLE profiles
  ADD COLUMN display_name VARCHAR(50) UNIQUE, -- Unique username
  ADD COLUMN community_enabled BOOLEAN DEFAULT false, -- Opt-in flag
  ADD COLUMN community_onboarded_at TIMESTAMPTZ; -- Track onboarding completion
```

### Content Metadata Format

#### Reflection Posts (`content_type = 'reflection'`)

```json
{
  "reflection_type": "morning" | "midday" | "evening",
  "fields_shared": ["intention", "gratitude"], // Which fields user shared
  "include_virtue": true | false
}
```

#### Chat Posts (`content_type = 'chat'`)

```json
{
  "conversation_id": "uuid",
  "share_method": "excerpt" | "ai_summary",
  "excerpt_messages": ["msg_id_1", "msg_id_2"], // If excerpt
  "summary_prompt": "...", // If AI summary
  "coach_name": "Marcus Aurelius"
}
```

#### Practice Posts (`content_type = 'practice'`)

```json
{
  "practice_id": "uuid",
  "practice_name": "Morning Meditation",
  "achievement_type": "milestone" | "streak" | "breakthrough",
  "streak_days": 30, // If applicable
  "user_note": "Optional personal reflection"
}
```

---

## API Design

### User Endpoints

#### `POST /api/community/opt-in`

Enable community for user + set display name

**Request**:
```json
{
  "display_name": "Phoenix",
  "accept_guidelines": true
}
```

**Response**:
```json
{
  "success": true,
  "display_name": "Phoenix",
  "community_enabled": true
}
```

**Errors**:
- 400: Display name taken
- 400: Display name invalid (length, characters)
- 400: Must accept guidelines

---

#### `GET /api/community/feed`

Get algorithmic or chronological feed

**Query Params**:
- `mode`: "for_you" | "recent" (default: "for_you")
- `virtue`: Filter by virtue
- `persona`: Filter by persona
- `content_type`: Filter by type
- `limit`: Number of posts (default: 20, max: 50)
- `offset`: Pagination offset

**Response**:
```json
{
  "posts": [
    {
      "id": "uuid",
      "display_name": "Phoenix",
      "virtue": "Wisdom",
      "persona_id": "marcus",
      "content_type": "reflection",
      "content_text": "...",
      "content_metadata": { /* type-specific */ },
      "reaction_count": 24,
      "user_has_reacted": false,
      "created_at": "2025-10-04T10:30:00Z",
      "original_date": "2025-10-04"
    }
  ],
  "has_more": true
}
```

---

#### `GET /api/community/search`

Search community posts

**Query Params**:
- `q`: Search query (required)
- `virtue`: Filter by virtue
- `persona`: Filter by persona
- `content_type`: Filter by type
- `date_from`: ISO date
- `date_to`: ISO date
- `limit`: Number of posts (default: 20)
- `offset`: Pagination

**Response**: Same as feed endpoint

---

#### `POST /api/community/posts`

Share new content to community

**Request**:
```json
{
  "content_type": "reflection" | "chat" | "practice",
  "source_id": "uuid", // ID of original content
  "source_table": "reflections" | "marcus_messages" | "habit_logs",
  "content_text": "...", // Formatted content
  "content_metadata": { /* type-specific */ },
  "share_method": "excerpt" | "ai_summary" | null
}
```

**Response**:
```json
{
  "success": true,
  "post": { /* full post object */ }
}
```

---

#### `DELETE /api/community/posts/:postId`

Unshare a post (sets `is_visible = false`)

**Response**:
```json
{
  "success": true,
  "message": "Post removed from community"
}
```

---

#### `POST /api/community/posts/:postId/react`

Add/remove reaction

**Request**:
```json
{
  "action": "add" | "remove"
}
```

**Response**:
```json
{
  "success": true,
  "reaction_count": 25,
  "user_has_reacted": true
}
```

---

#### `POST /api/community/posts/:postId/report`

Report inappropriate content

**Response**:
```json
{
  "success": true,
  "message": "Report submitted for review"
}
```

---

#### `GET /api/community/widget`

Get 3-5 posts for Today page carousel

**Response**:
```json
{
  "posts": [ /* 3-5 post objects */ ]
}
```

---

### Admin Endpoints

#### `GET /api/admin/community/reports`

Get reported content queue

**Query Params**:
- `status`: "pending" | "reviewed" | "dismissed" | "actioned"
- `limit`: Number of reports (default: 20)
- `offset`: Pagination

**Response**:
```json
{
  "reports": [
    {
      "id": "uuid",
      "post": { /* full post object */ },
      "reporter_user_id": "uuid",
      "status": "pending",
      "created_at": "2025-10-04T10:30:00Z"
    }
  ],
  "has_more": true
}
```

---

#### `POST /api/admin/community/reports/:reportId/action`

Take action on reported content

**Request**:
```json
{
  "action": "delete" | "hide" | "dismiss",
  "admin_notes": "Optional notes"
}
```

**Actions**:
- `delete`: Remove post completely (CASCADE deletes reactions, reports)
- `hide`: Set `is_visible = false`, keep for records
- `dismiss`: Mark report as reviewed/false alarm

**Response**:
```json
{
  "success": true,
  "action_taken": "hide",
  "post_id": "uuid"
}
```

---

## UI Components

### New Components

1. **`<CommunityOnboardingModal />`**
   - Community guidelines
   - Display name picker with validation
   - Accept button

2. **`<CommunityFeed />`**
   - Tab switcher (For You / Recent)
   - Filter bar
   - Infinite scroll post list
   - Empty states

3. **`<CommunityPostCard />`**
   - Dynamic rendering based on `content_type`
   - Reaction button with count
   - Report button
   - Timestamp formatting

4. **`<CommunityWidgetCarousel />`**
   - Swipeable carousel for Today page
   - Compact post cards
   - "View All" link to Community page

5. **`<ShareToCommun ityButton />`**
   - Appears after saving reflections/completing practices
   - Opens share preview modal

6. **`<SharePreviewModal />`**
   - Shows how post will appear
   - Method selector (for chats: excerpt vs AI summary)
   - Confirm/cancel

7. **`<CommunitySearchBar />`**
   - Search input with suggestions
   - Filter panel (collapsible)
   - Clear filters button

8. **`<AdminReportsQueue />`**
   - List of reported posts
   - Action buttons (delete, hide, dismiss)
   - Admin notes textarea

### Updated Components

1. **`<SettingsPage />`**
   - Add "Community" section
   - Toggle to enable/disable
   - Link to display name change

2. **`<TodayPage />`**
   - Add `<CommunityWidgetCarousel />` (if enabled)

3. **`<MainNavigation />`**
   - Add "Community" link (if enabled)

4. **`<ReflectionComposer />`**
   - Add `<ShareToCommunityButton />` after save

5. **`<CoachWorkspace />`**
   - Add "Share" icon/button in message actions

6. **`<AdminDashboard />`**
   - Add "Reports" tab with `<AdminReportsQueue />`

---

## State Management

### New Zustand Store: `community-store.ts`

```typescript
interface CommunityState {
  // User preferences
  isEnabled: boolean;
  displayName: string | null;

  // Feed state
  feedPosts: CommunityPost[];
  feedMode: 'for_you' | 'recent';
  feedFilters: {
    virtue?: string;
    persona?: string;
    contentType?: string;
  };

  // Widget state
  widgetPosts: CommunityPost[];

  // Actions
  enableCommunity: (displayName: string) => Promise<void>;
  fetchFeed: (options?) => Promise<void>;
  fetchWidget: () => Promise<void>;
  sharePost: (data: SharePostData) => Promise<void>;
  reactToPost: (postId: string, action: 'add' | 'remove') => Promise<void>;
  reportPost: (postId: string) => Promise<void>;
  unsharePost: (postId: string) => Promise<void>;
  setFeedMode: (mode: 'for_you' | 'recent') => void;
  setFeedFilters: (filters: FeedFilters) => void;
}
```

---

## AI Integration

### Chat Summary Generation

When user selects "AI Summary" for sharing a conversation:

1. **Identify conversation context**:
   - Conversation ID
   - Active persona
   - Message history

2. **Generate summary prompt**:
```
You are {persona_name}. A user had an insightful conversation with you and wants to share the key wisdom with others.

Conversation:
{message_history}

Create a brief summary (2-3 sentences) that captures the core insight from this exchange. Write in your authentic voice as {persona_name}. Focus on the philosophical wisdom, not the specific personal details.
```

3. **Call AI provider** (same system as coach):
   - Use `aiOrchestrator.complete()`
   - Persona-specific model
   - Max 200 tokens

4. **Return formatted summary**:
```json
{
  "summary": "Consider that obstacles are not hindrances but opportunities...",
  "persona": "marcus",
  "token_count": 47
}
```

### Widget Recommendation Algorithm

**Inputs**:
- User's current virtue focus
- User's active persona
- User's recent activity (last 7 days)
- Time of day

**Algorithm**:
```typescript
async function getWidgetPosts(userId: string): Promise<CommunityPost[]> {
  const user = await getProfile(userId);
  const posts = await getCommunityPosts({
    limit: 20,
    is_visible: true,
    created_at: 'last_7_days'
  });

  // Score each post
  const scored = posts.map(post => ({
    post,
    score: calculateScore(post, user)
  }));

  // Sort by score, take top 5
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.post);
}

function calculateScore(post: CommunityPost, user: Profile): number {
  let score = 0;

  // Matching virtue (50% weight)
  if (post.virtue === user.preferred_virtue) {
    score += 50;
  }

  // Matching persona (30% weight)
  if (post.persona_id === user.preferred_persona) {
    score += 30;
  }

  // Freshness (20% weight, decay over 7 days)
  const ageHours = (Date.now() - post.created_at) / (1000 * 60 * 60);
  const freshnessScore = Math.max(0, 20 - (ageHours / 168 * 20)); // 168 hours = 7 days
  score += freshnessScore;

  return score;
}
```

---

## Security & Privacy

### Row Level Security (RLS)

```sql
-- Users can view visible community posts
CREATE POLICY "Users can view visible posts"
  ON community_posts
  FOR SELECT
  USING (is_visible = true);

-- Users can insert their own posts
CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON community_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can react to any visible post
CREATE POLICY "Users can react to posts"
  ON community_reactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND is_visible = true
    )
  );

-- Users can report any visible post (but not their own)
CREATE POLICY "Users can report posts"
  ON community_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_user_id
    AND EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id
      AND is_visible = true
      AND user_id != auth.uid() -- Can't report own posts
    )
  );

-- Admins can manage reports
CREATE POLICY "Admins can manage reports"
  ON community_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

### Content Sanitization

- **Input validation**: Sanitize all user-generated content (display names, posts)
- **XSS prevention**: Escape HTML in content rendering
- **URL validation**: Check for malicious links (future, when resharing enabled)
- **Display name rules**:
  - 3-50 characters
  - Alphanumeric + spaces, dashes, underscores
  - No profanity (basic filter)
  - Must be unique

### Data Privacy

- **Denormalized data**: Posts store snapshot of data at share time (original stays private)
- **Unsharing**: Removes from feed but keeps for moderation
- **User deletion**: CASCADE deletes all community posts/reactions/reports
- **Anonymous viewing**: Can't see who reacted, just count
- **No follower graph**: No user-to-user connections (v1)

---

## Analytics & Monitoring

### Events to Track

**User Events**:
- `community_opted_in` - User enabled community
- `community_post_shared` - User shared content
  - Properties: content_type, share_method, virtue, persona
- `community_post_viewed` - User viewed a post
- `community_post_reacted` - User reacted to post
- `community_post_unshared` - User removed their post
- `community_post_reported` - User reported content
- `community_feed_filtered` - User applied filters
- `community_searched` - User searched (query, results_count)

**Admin Events**:
- `community_report_actioned` - Admin took action
  - Properties: action (delete/hide/dismiss), post_id

**System Metrics**:
- Daily active community users
- Posts shared per day
- Reactions per post (avg)
- Report rate (reports / posts)
- Search usage rate
- Widget click-through rate

### Dashboards

1. **Community Health**:
   - Opt-in rate over time
   - Daily active participants
   - Content type distribution
   - Virtue/persona distribution

2. **Engagement**:
   - Reactions per post (avg, median)
   - Views per post
   - Share rate (users who share / total users)
   - Widget CTR

3. **Moderation**:
   - Reports per day
   - Report resolution time (avg)
   - Action breakdown (delete/hide/dismiss %)
   - Repeat offenders

---

## Testing Strategy

### Unit Tests

**Content Formatting** (`lib/community/formatters.ts`):
- `formatReflectionPost()` - Formats reflection for sharing
- `formatChatExcerpt()` - Formats selected messages
- `formatPracticeAchievement()` - Formats practice milestone
- `validateDisplayName()` - Display name validation

**Scoring Algorithm** (`lib/community/scoring.ts`):
- `calculatePostScore()` - Post ranking logic
- `getWidgetPosts()` - Widget recommendation
- `filterByVirtue()` - Virtue filtering
- `filterByPersona()` - Persona filtering

### Integration Tests

**API Routes**:
- `POST /api/community/opt-in` - Onboarding flow
- `GET /api/community/feed` - Feed retrieval with filters
- `POST /api/community/posts` - Share content
- `POST /api/community/posts/:id/react` - Reaction logic
- `POST /api/community/posts/:id/report` - Reporting
- `DELETE /api/community/posts/:id` - Unsharing

**Database**:
- RLS policies enforce access control
- Cascade deletes work correctly
- Unique constraint on display_name
- Indexes improve query performance

### E2E Tests (`e2e/specs/community.spec.ts`)

**User Flows**:
1. **Opt-in and onboarding**:
   - Enable community in settings
   - Choose display name
   - See onboarding modal
   - Access community page

2. **Share reflection**:
   - Complete morning reflection
   - Click "Share with Community"
   - Preview and confirm
   - See post in feed

3. **Browse and react**:
   - View community feed
   - Apply filters (virtue, persona)
   - React to a post
   - See reaction count update

4. **Search**:
   - Enter search query
   - Apply date filter
   - View results
   - Click through to full post

5. **Admin moderation**:
   - Report a post
   - Admin sees in queue
   - Admin hides post
   - Post removed from feed

---

## Deployment Plan

### Phase 1: Database & Backend (Week 1)

**Tasks**:
- Create database migrations (tables, indexes, RLS)
- Build API endpoints (user + admin)
- Implement content formatters
- Add AI summary generation
- Write unit + integration tests

**Deliverables**:
- All tables created
- 9 API endpoints working
- Tests passing (>80% coverage)

---

### Phase 2: Core UI Components (Week 2)

**Tasks**:
- Build `<CommunityOnboardingModal />`
- Build `<CommunityFeed />` and `<CommunityPostCard />`
- Build `<SharePreviewModal />`
- Create Zustand store
- Add to Settings page

**Deliverables**:
- Users can opt-in
- Users can view feed
- Users can share content
- Community page functional

---

### Phase 3: Search & Widget (Week 3)

**Tasks**:
- Build `<CommunitySearchBar />` with filters
- Implement search API logic
- Build `<CommunityWidgetCarousel />`
- Add widget to Today page
- Implement ranking algorithm

**Deliverables**:
- Full-text search working
- Widget showing personalized posts
- Algorithmic feed ("For You") working

---

### Phase 4: Moderation & Polish (Week 4)

**Tasks**:
- Build `<AdminReportsQueue />`
- Add moderation endpoints
- Implement reporting flow
- Add analytics events
- E2E tests
- QA and bug fixes

**Deliverables**:
- Moderation system working
- All analytics instrumented
- E2E tests passing
- Production-ready

---

## Future Enhancements (v2+)

### Already Discussed for Later:
- **Comments system** - Threaded discussions on posts
- **Resharing** - Quote-share posts with commentary
- **Engagement ranking** - Surface trending/popular content
- **AI content filtering** - Automated moderation

### Additional Ideas:
- **Opt-in groups** - Private circles (e.g., "Stoic Book Club")
- **Following system** - Follow specific users
- **Notifications** - When someone reacts to your post
- **Streak sharing** - Automatic milestone posts
- **Wisdom collections** - Save favorite posts
- **Export/share externally** - Generate shareable images
- **Community challenges** - Group practice goals
- **Voice of the week** - Featured users/posts
- **Community personas** - AI trained on community wisdom
- **Premium features** - Ad-free, analytics, advanced search

---

## Success Criteria

**Launch Readiness**:
- [ ] All 9 user API endpoints deployed
- [ ] All 2 admin endpoints deployed
- [ ] Feed algorithm tested and tuned
- [ ] Moderation queue functional
- [ ] E2E tests passing
- [ ] Analytics events firing
- [ ] Performance: Feed loads <500ms (p95)
- [ ] Security: RLS policies tested
- [ ] Documentation complete

**30-Day Post-Launch**:
- [ ] 30% opt-in rate achieved
- [ ] <2% content report rate
- [ ] 10% of community users sharing monthly
- [ ] 15% retention lift for participants
- [ ] <1% false positive moderation rate

---

## Open Questions & Decisions Needed

1. **Display name changes**: Should users be able to change display name? How often?
2. **AI summary cost**: Monitor OpenAI API costs for summary generation at scale
3. **Content licensing**: Do we need terms for shared content ownership?
4. **Internationalization**: How do we handle non-English content in search/moderation?
5. **Reaction limits**: Should there be a cooldown or limit on reactions?
6. **Feed personalization**: How much to weight virtue vs persona vs freshness? A/B test?

---

**Document Status**: Ready for Review
**Next Steps**: Review with team → Create task breakdown → Begin Phase 1 implementation
