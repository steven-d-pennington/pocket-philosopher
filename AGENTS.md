# AGENTS.md - Pocket Philosopher Developer Onboarding Guide

**Last Updated**: October 4, 2025
**Status**: Production Ready ✅

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Codebase Structure](#codebase-structure)
6. [Core Features](#core-features)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [State Management](#state-management)
10. [AI System Deep Dive](#ai-system-deep-dive)
11. [Testing Strategy](#testing-strategy)
12. [Development Workflow](#development-workflow)
13. [Key Patterns & Conventions](#key-patterns--conventions)
14. [Known Issues & TODOs](#known-issues--todos)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- **Node.js** 20+
- **npm** 10+
- **Docker Desktop** (running)
- **Supabase CLI** (bundled via `npx supabase`)

### Setup (5 minutes)
```bash
# 1. Install dependencies
npm install

# 2. Start Supabase (custom ports to avoid Windows conflicts)
npx supabase start

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with Supabase keys from step 2

# 4. Run the app
npm run dev

# Open http://localhost:3001
```

### Custom Ports
This repo uses **non-standard Supabase ports** to avoid Windows WSL conflicts:
- **API**: `55432`
- **DB**: `55433`
- **Studio**: `55434`
- **Mailpit**: `55435`

Update `.env.local` accordingly:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55432
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

---

## Project Overview

**Pocket Philosopher** is a daily philosophical practice application that combines:
- 📝 **Daily journaling** (morning/midday/evening reflections)
- ✅ **Virtue-based habit tracking** (practices aligned with philosophical virtues)
- 🤖 **AI coaching** (6 philosophical personas powered by multiple LLM providers)
- 📊 **Progress analytics** (Return Score, streaks, virtue balance)
- 💰 **Freemium monetization** (Stripe-powered coach expansion packs)

### Product Mission
Deliver a daily philosophical companion blending practice tracking, reflective journaling, and multi-tradition AI mentors serving growth-oriented users seeking Stoic, Taoist, Existentialist wisdom.

### Current Status
✅ **Production Ready** - All Q4 workstreams complete:
- AI & Knowledge System (5 phases complete)
- Frontend Architecture (PWA, offline sync)
- Backend Infrastructure (Supabase, RLS, triggers)
- Analytics & Observability (PostHog, structured logging)
- Deployment & Operations (Docker, runbooks)

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router) - Server components, streaming
- **React 19** - Latest features, concurrent rendering
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - 13 components (alert-dialog, badge, button, card, dialog, etc.)
- **Framer Motion** - Animations and transitions
- **Zustand** - Client state management (9 stores)
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling with Zod validation

### Backend
- **Supabase** - BaaS platform (Postgres, Auth, Storage, Realtime)
- **PostgreSQL** - Database with pgvector extension
- **Row-Level Security (RLS)** - Security policies on all tables
- **Server-Sent Events (SSE)** - Streaming AI responses

### AI/ML
- **OpenAI** (GPT-4o-mini, text-embedding-3-small)
- **Anthropic** (Claude models)
- **Together AI** (open-source models)
- **Ollama** (local models)
- **pgvector** - Vector similarity search
- **RAG Pipeline** - Retrieval-augmented generation

### Payments
- **Stripe** - Checkout, webhooks, one-time purchases

### Analytics
- **PostHog** - Event tracking, feature flags, session replay

### Testing
- **Jest** - Unit/integration tests
- **Playwright** - E2E tests
- **Testing Library** - Component tests

### DevOps
- **Docker** - Local Supabase containerization
- **Supabase CLI** - Migrations, seed data
- **ESLint** (flat config) - Code quality
- **Prettier** - Code formatting

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Public    │  │ Authenticated│  │     Admin       │ │
│  │   Routes    │  │   Dashboard  │  │   Dashboard     │ │
│  │ (auth pages)│  │  (features)  │  │ (env-gated)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│   Supabase    │   │  AI Provider  │   │    Stripe    │
│  (Postgres +  │   │   Registry    │   │  (Payments)  │
│   Auth + RLS) │   │   (Failover)  │   │              │
└───────────────┘   └───────────────┘   └──────────────┘
        │                   │
        │           ┌───────┴─────────┐
        │           │                 │
        ▼           ▼                 ▼
┌───────────┐   ┌─────────┐   ┌──────────────┐
│ pgvector  │   │ OpenAI  │   │  Anthropic   │
│  (RAG)    │   │         │   │   Together   │
│           │   │ Ollama  │   │              │
└───────────┘   └─────────┘   └──────────────┘
```

### Request Flow

**User Action → API Route → Business Logic → Database → Response**

1. **Client**: User interacts with React component
2. **Store**: Zustand/Query updates optimistic state
3. **API Route**: Next.js API route validates request
4. **Auth**: Supabase session validation
5. **Business Logic**: Data transformation, AI orchestration
6. **Database**: Supabase query with RLS
7. **Response**: JSON/SSE stream back to client
8. **UI Update**: Store updates, component re-renders

---

## Codebase Structure

### Directory Layout

```
pocket-philosopher/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── today/                # Daily dashboard
│   │   ├── practices/            # Habit management
│   │   ├── reflections/          # Journaling
│   │   ├── marcus/               # AI coach
│   │   ├── profile/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── admin/                    # Admin dashboard (env-gated)
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── purchases/
│   │   ├── content/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── practices/
│   │   ├── reflections/
│   │   ├── marcus/
│   │   ├── daily-progress/
│   │   ├── progress/
│   │   ├── ai/
│   │   ├── purchases/
│   │   ├── admin/
│   │   ├── health/
│   │   └── debug/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives (13 components)
│   ├── dashboard/                # Dashboard-specific (12 components)
│   ├── practices/                # Practice management (6 components)
│   ├── reflections/              # Reflection components (3)
│   ├── marcus/                   # Coach UI (2)
│   ├── shared/                   # Shared components (12)
│   ├── admin/                    # Admin components (6)
│   └── providers/                # Context providers (4)
│
├── lib/                          # Core library code
│   ├── ai/                       # AI system
│   │   ├── provider-registry.ts  # Multi-provider abstraction
│   │   ├── orchestrator.ts       # Chat orchestration
│   │   ├── retrieval.ts          # RAG pipeline
│   │   ├── personas.ts           # Persona definitions
│   │   ├── prompts/              # Prompt templates
│   │   └── providers/            # Provider clients (4)
│   ├── analytics/                # PostHog integration
│   ├── constants/                # Personas, quotes, insights, practices
│   ├── hooks/                    # Custom React hooks (11)
│   ├── stores/                   # Zustand stores (9)
│   ├── supabase/                 # Supabase clients
│   ├── security/                 # Sanitization, validation
│   ├── middleware/               # Admin auth, rate limiting
│   ├── logging/                  # Structured logging
│   ├── offline/                  # Draft persistence
│   └── utils.ts                  # Utility functions
│
├── database/                     # Database artifacts
│   ├── schema.sql                # Full schema
│   └── migrations/               # Migration files
│
├── supabase/                     # Supabase local config
│   ├── config.toml               # Custom ports configuration
│   ├── seed.sql                  # Optional seed data
│   └── migrations/               # Auto-generated migrations
│
├── e2e/                          # Playwright E2E tests
│   ├── specs/                    # Test suites (4)
│   ├── fixtures/                 # Test data
│   └── utils/                    # Test helpers
│
├── __tests__/                    # Jest unit tests
│   ├── api/                      # API route tests
│   ├── components/               # Component tests
│   └── lib/                      # Library tests
│
├── docs/                         # Documentation (159 files)
│   ├── build-plan/               # Feature specifications
│   ├── deployment/               # Runbooks and checklists
│   ├── ai/                       # AI system docs
│   ├── analytics/                # PostHog guides
│   └── future-work/              # Enhancement ideas
│
├── public/                       # Static assets
│   ├── manifest.webmanifest      # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # App icons
│
└── styles/                       # Global styles
    └── globals.css               # Tailwind imports
```

### Key Files to Know

**Configuration**:
- `package.json` - Dependencies, scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind customization
- `tsconfig.json` - TypeScript settings
- `.env.local` - Environment variables (create from `.env.example`)

**Entry Points**:
- `app/layout.tsx` - Root layout with providers
- `app/(dashboard)/layout.tsx` - Authenticated layout
- `app/api/*/route.ts` - API route handlers

**Core Libraries**:
- `lib/ai/orchestrator.ts` - AI chat orchestration
- `lib/ai/retrieval.ts` - RAG pipeline
- `lib/ai/provider-registry.ts` - Multi-provider failover
- `lib/stores/*` - State management
- `lib/supabase/server-client.ts` - Server-side DB access

---

## Core Features

### 1. Daily Dashboard ("Today" View)

**Location**: `app/(dashboard)/today/page.tsx`

**Purpose**: Unified daily practice hub combining intention-setting, practice tracking, quotes, insights, and evening reflection.

**Components**:
```
┌──────────────────────────────────────┐
│  Daily Quote (persona-specific)      │
├──────────────────────────────────────┤
│  Daily Insight (rotating wisdom)     │
├──────────────────────────────────────┤
│  Morning Intention Widget            │
├──────────────────────────────────────┤
│  Practice Quick-Toggle Widgets       │
│  (customizable, drag-to-reorder)     │
├──────────────────────────────────────┤
│  Return Score Tiles (virtue metrics) │
├──────────────────────────────────────┤
│  Reflection Status                   │
├──────────────────────────────────────┤
│  Coach Preview (AI suggestions)      │
└──────────────────────────────────────┘
```

**Key Features**:
- Widget customization (show/hide, reorder)
- Persona-specific quotes and insights (rotates daily)
- Real-time practice completion tracking
- Return Score calculation (virtue-based metrics)
- Reflection completion status

**State Management**:
- `dashboard-preferences-store.ts` - Widget layout
- `daily-progress-store.ts` - Progress tracking
- `practices-store.ts` - Practice data

**API Dependencies**:
- `GET /api/daily-progress` - Daily metrics
- `POST /api/daily-progress` - Update intention
- `GET /api/practices` - Practice list

---

### 2. Practices Management

**Location**: `app/(dashboard)/practices/page.tsx`

**Purpose**: Full CRUD for virtue-tagged practices with scheduling, reminders, and drag-and-drop ordering.

**Features**:
- ✅ Create/Edit practices with modal forms
- ✅ Archive/restore functionality
- ✅ Virtue categorization (Wisdom, Courage, Temperance, Justice)
- ✅ Frequency settings (daily, weekly, custom)
- ✅ Reminder time configuration
- ✅ Difficulty levels (Easy, Medium, Hard)
- ✅ Active days selection (Monday-Sunday)
- ✅ Drag-and-drop reordering (@dnd-kit)
- ✅ Filter by virtue, status (active/archived)

**Database Table**: `habits`
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  virtue VARCHAR(50), -- wisdom, justice, temperance, courage
  frequency VARCHAR(20) DEFAULT 'daily',
  active_days JSONB,
  reminder_time TIME,
  difficulty VARCHAR(20),
  sort_order INT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**State**: `practices-store.ts` (Zustand with persist)

**API**:
- `GET /api/practices` - List practices
- `POST /api/practices` - Create practice
- `PATCH /api/practices/:id` - Update practice
- `DELETE /api/practices/:id` - Delete practice

---

### 3. Reflections / Journaling

**Location**: `app/(dashboard)/reflections/page.tsx`

**Purpose**: Guided morning/midday/evening journaling with mood tracking and virtue focus.

**Reflection Types**:

1. **Morning Reflection**
   - Intention for the day
   - Challenges anticipated
   - Virtue focus
   - Mood (before)

2. **Midday Reflection**
   - Progress check-in
   - Adjustments needed
   - Key insights
   - Mood (current)

3. **Evening Reflection**
   - What went well (wins)
   - What was challenging
   - Lessons learned
   - Gratitude
   - Mood (after)

**Database Table**: `reflections`
```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(20), -- morning, midday, evening
  mood_before INT,
  mood_after INT,
  content JSONB, -- {intention, challenges, insights, wins, gratitude, etc.}
  virtue_focus VARCHAR(50),
  created_at TIMESTAMPTZ
);
```

**Features**:
- Guided prompts per reflection type
- Mood sliders (1-10 scale)
- Virtue selection
- Rolling timeline view
- Completion status tracking
- Persona-aware prompting (future enhancement)

**API**:
- `GET /api/reflections` - List reflections
- `POST /api/reflections` - Create reflection
- `PATCH /api/reflections/:id` - Update reflection

---

### 4. AI Coach System (Marcus + Personas)

**Location**: `app/(dashboard)/marcus/page.tsx`

**Purpose**: Chat-style AI coaching with 6 philosophical personas, streaming responses, and citation system.

#### Available Personas (6 total)

| Persona | Tradition | Access | ID |
|---------|-----------|--------|-----|
| **Marcus Aurelius** | Stoicism | FREE | `marcus` |
| **Epictetus** | Stoicism | PREMIUM | `epictetus` |
| **Laozi** | Taoism | PREMIUM | `lao` |
| **Simone de Beauvoir** | Existentialism | PREMIUM | `simone` |
| **Aristotle** | Virtue Ethics | PREMIUM | `aristotle` |
| **Plato** | Classical Philosophy | PREMIUM | `plato` |

#### Conversation Modes

1. **Buddy Mode** - Casual, conversational friend-like dialogue
2. **Coaching Mode** - Structured, guidance-focused responses with action steps

#### Key Features
- ✅ **Streaming responses** (SSE/ReadableStream)
- ✅ **Citation system** (inline [[chunk_id]] markers resolved to sources)
- ✅ **Conversation persistence** (saved to `marcus_conversations` table)
- ✅ **Context-aware** (user practices, reflections, profile)
- ✅ **Entitlement-based access** (premium personas locked)
- ✅ **Multi-provider failover** (OpenAI → Anthropic → Together → Ollama)
- ✅ **RAG integration** (philosophy corpus retrieval)

#### Database Tables
```sql
-- Conversations
CREATE TABLE marcus_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  persona_id VARCHAR(50), -- marcus, epictetus, lao, simone, etc.
  mode VARCHAR(20), -- buddy, coaching
  created_at TIMESTAMPTZ
);

-- Messages
CREATE TABLE marcus_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES marcus_conversations(id),
  role VARCHAR(20), -- user, assistant
  content TEXT,
  citations JSONB,
  context JSONB,
  created_at TIMESTAMPTZ
);
```

#### API Flow
```
POST /api/marcus
  ↓
1. Validate entitlement (if premium persona)
2. Load/create conversation
3. Aggregate user context (profile, habits, reflections)
4. Retrieve relevant philosophy chunks (RAG)
5. Build persona-specific prompt
6. Stream LLM response (SSE)
7. Extract citations from [[chunk_id]] markers
8. Save message to database
9. Return response with citations
```

**State**: `coach-store.ts` (active persona, messages, streaming state)

---

### 5. Progress Tracking & Analytics

**Location**: `app/(dashboard)/today/page.tsx` (Return Score tiles)

**Purpose**: Virtue-based progress metrics, streaks, completion rates.

#### Return Score Calculation

**Formula**:
```
Return Score = (virtue_scores_sum / 4) * habit_completion_rate
```

**Virtue Scores** (0-100 each):
- **Wisdom** - Reflective practices, learning
- **Justice** - Community, connection practices
- **Temperance** - Mindfulness, moderation practices
- **Courage** - Challenge, resilience practices

**Database Table**: `daily_progress`
```sql
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  return_score DECIMAL,
  streak_days INT,
  virtue_wisdom DECIMAL,
  virtue_justice DECIMAL,
  virtue_temperance DECIMAL,
  virtue_courage DECIMAL,
  habits_completed INT,
  habits_total INT,
  has_morning_reflection BOOLEAN,
  has_evening_reflection BOOLEAN,
  morning_intention TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);
```

**Auto-Calculation**: PostgreSQL trigger `calculate_daily_progress` runs on:
- Habit log insert/update
- Reflection insert/update

**API**:
- `GET /api/daily-progress` - Get today's progress
- `POST /api/daily-progress` - Update intention
- `GET /api/progress?period=week|month` - Historical data

**Metrics Displayed**:
- Return Score (composite)
- Current streak (consecutive active days)
- Virtue balance (radar chart - future)
- Completion rate (%)

---

### 6. Monetization System

**Location**: `app/api/purchases/*`

**Business Model**: Freemium
- **Free**: Marcus Aurelius (Stoic coach)
- **Premium**: Expansion packs at $3.99 each (Laozi, Simone, Epictetus, Aristotle, Plato)

#### Payment Flow
```
1. User clicks "Unlock Coach" button
   ↓
2. POST /api/purchases/create-session
   - Creates Stripe Checkout session
   - Saves pending purchase record
   ↓
3. User completes Stripe payment
   ↓
4. Stripe sends webhook to /api/purchases/webhook
   ↓
5. Webhook handler:
   - Validates signature
   - Updates purchase status
   - Grants entitlement
   ↓
6. User gets access to coach
```

#### Database Tables
```sql
-- Products (coach personas)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  name TEXT,
  description TEXT,
  price_cents INT,
  persona_id VARCHAR(50),
  active BOOLEAN DEFAULT TRUE
);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INT,
  status VARCHAR(20), -- pending, completed, failed, refunded
  created_at TIMESTAMPTZ
);

-- Entitlements (active access)
CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  source VARCHAR(20), -- purchase, grant, trial
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

**API**:
- `POST /api/purchases/create-session` - Create Stripe checkout
- `POST /api/purchases/webhook` - Stripe webhook handler
- `GET /api/purchases` - User purchase history

**Entitlement Check**: `useEntitlements()` hook checks access before showing coach

---

### 7. Admin Dashboard

**Location**: `app/admin/*`

**Access Control**: Environment-gated (`ADMIN_DASHBOARD=true`) + admin role

**Pages**:
1. **Dashboard** (`/admin/dashboard`) - Overview metrics
2. **Users** (`/admin/users`) - User management, search, detail view
3. **Purchases** (`/admin/purchases`) - Transaction history, refunds
4. **Entitlements** (`/admin/entitlements`) - Grant/revoke access
5. **Content** (`/admin/content`) - Philosophy corpus management
6. **Analytics** (`/admin/analytics`) - Usage metrics, revenue
7. **Settings** (`/admin/settings`) - App configuration

**Security**:
- ✅ Environment variable gate (`ADMIN_DASHBOARD=true`)
- ✅ Admin role check (`profiles.is_admin = true`)
- ⚠️ **TODO**: Re-enable strict admin auth (currently permissive for dev)

**Audit Logging**:
- Schema: `admin_audit_log` table
- ⚠️ **TODO**: Wire up logging to admin actions

**API**:
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/users` - User list
- `POST /api/admin/entitlements/grant` - Grant entitlement
- `POST /api/admin/entitlements/:id/revoke` - Revoke entitlement

---

## Database Schema

### Core Tables (15 total)

#### User & Profile
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  virtue_focus VARCHAR(50)[],
  persona_roster VARCHAR(50)[],
  notification_cadence VARCHAR(20),
  privacy_mode BOOLEAN,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Practices
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  virtue VARCHAR(50),
  frequency VARCHAR(20),
  active_days JSONB,
  reminder_time TIME,
  difficulty VARCHAR(20),
  sort_order INT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  mood INT,
  notes TEXT
);
```

#### Reflections
```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(20), -- morning, midday, evening
  mood_before INT,
  mood_after INT,
  content JSONB,
  virtue_focus VARCHAR(50),
  created_at TIMESTAMPTZ
);
```

#### Progress
```sql
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  return_score DECIMAL,
  streak_days INT,
  virtue_wisdom DECIMAL,
  virtue_justice DECIMAL,
  virtue_temperance DECIMAL,
  virtue_courage DECIMAL,
  habits_completed INT,
  habits_total INT,
  has_morning_reflection BOOLEAN,
  has_evening_reflection BOOLEAN,
  morning_intention TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);
```

#### AI Coach
```sql
CREATE TABLE marcus_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  persona_id VARCHAR(50),
  mode VARCHAR(20), -- buddy, coaching
  created_at TIMESTAMPTZ
);

CREATE TABLE marcus_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES marcus_conversations(id),
  role VARCHAR(20), -- user, assistant
  content TEXT,
  citations JSONB,
  context JSONB,
  created_at TIMESTAMPTZ
);

-- RAG knowledge base
CREATE TABLE philosophy_chunks (
  id UUID PRIMARY KEY,
  work TEXT,
  author TEXT,
  tradition VARCHAR(50),
  section TEXT,
  content TEXT,
  embedding vector(1536), -- OpenAI text-embedding-3-small
  virtue VARCHAR(50),
  persona_tags VARCHAR(50)[],
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ
);

-- Vector search index
CREATE INDEX philosophy_chunks_embedding_idx
  ON philosophy_chunks
  USING ivfflat (embedding vector_cosine_ops);
```

#### Monetization
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  name TEXT,
  description TEXT,
  price_cents INT,
  persona_id VARCHAR(50),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INT,
  status VARCHAR(20),
  created_at TIMESTAMPTZ
);

CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  source VARCHAR(20), -- purchase, grant, trial
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

#### Admin & Config
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(100),
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ
);

CREATE TABLE app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ
);
```

### Database Triggers

**Auto-Update Timestamps**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: profiles, habits, daily_progress
```

**Daily Progress Calculation**:
```sql
CREATE OR REPLACE FUNCTION calculate_daily_progress()
RETURNS TRIGGER AS $$
-- Recalculates virtue scores, return score, streaks
-- Triggered on habit_logs, reflections insert/update
```

### Row-Level Security (RLS)

**All tables have RLS enabled**:
```sql
-- Example: habits table
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own habits
CREATE POLICY "Users can CRUD own habits"
  ON habits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can access all habits
CREATE POLICY "Admins can access all habits"
  ON habits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );
```

---

## API Routes

### User-Facing APIs

#### Authentication
```
GET  /api/auth          - Get session
POST /api/auth/signup   - Create account
POST /api/auth/login    - Sign in
POST /api/auth/logout   - Sign out
```

#### Profile
```
GET   /api/profile      - Get user profile
PATCH /api/profile      - Update profile
```

#### Practices
```
GET    /api/practices            - List practices
POST   /api/practices            - Create practice
PATCH  /api/practices/:id        - Update practice
DELETE /api/practices/:id        - Delete practice
POST   /api/practices/:id/log    - Log completion
```

#### Reflections
```
GET    /api/reflections          - List reflections
POST   /api/reflections          - Create reflection
PATCH  /api/reflections/:id      - Update reflection
DELETE /api/reflections/:id      - Delete reflection
```

#### AI Coach
```
GET  /api/marcus?conversationId  - Get conversation messages
POST /api/marcus                 - Send message (SSE stream)
  Body: {
    message: string,
    conversationId?: string,
    personaId: string,
    mode: 'buddy' | 'coaching'
  }
```

#### Progress
```
GET  /api/daily-progress         - Get today's progress
POST /api/daily-progress         - Update intention
GET  /api/progress?period=week   - Historical progress
```

#### Purchases
```
POST /api/purchases/create-session
  Body: { productId: string }
  Response: { sessionId: string, url: string }

POST /api/purchases/webhook      - Stripe webhook
```

#### Utilities
```
GET /api/health                  - Health check
GET /api/debug                   - Debug info (dev only)
```

### Admin APIs

```
GET  /api/admin/dashboard        - Dashboard metrics
GET  /api/admin/users            - List users
GET  /api/admin/users/:id        - User detail
POST /api/admin/users/:id/disable - Disable account
POST /api/admin/users/:id/reset-password - Reset password

GET  /api/admin/purchases        - Purchase history
POST /api/admin/purchases/:id/refund - Process refund

GET  /api/admin/entitlements     - List entitlements
POST /api/admin/entitlements/grant - Grant entitlement
POST /api/admin/entitlements/:id/revoke - Revoke entitlement

GET  /api/admin/content          - Philosophy content
GET  /api/admin/analytics        - Analytics data
GET  /api/admin/settings         - App settings
POST /api/admin/settings         - Update settings
```

### API Response Format

**Success**:
```json
{
  "data": { /* response payload */ },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-10-04T12:00:00Z"
  }
}
```

**Error**:
```json
{
  "error": {
    "message": "Human-readable error",
    "code": "ERROR_CODE",
    "details": { /* context */ }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-10-04T12:00:00Z"
  }
}
```

---

## State Management

### Zustand Stores (9 total)

#### 1. **auth-store.ts**
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}
```

#### 2. **coach-store.ts**
```typescript
interface CoachState {
  activePersona: PersonaId;
  mode: 'buddy' | 'coaching';
  conversationsByPersona: Record<PersonaId, Message[]>;
  streamingState: StreamingState;
  citations: Citation[];
  setActivePersona: (persona: PersonaId) => void;
  setMode: (mode: 'buddy' | 'coaching') => void;
  addMessage: (personaId: PersonaId, message: Message) => void;
  setStreamingState: (state: StreamingState) => void;
}
```

#### 3. **practices-store.ts** (with persist)
```typescript
interface PracticesState {
  practices: Practice[];
  filter: { virtue?: Virtue; status?: 'active' | 'archived' };
  setPractices: (practices: Practice[]) => void;
  addPractice: (practice: Practice) => void;
  updatePractice: (id: string, updates: Partial<Practice>) => void;
  reorderPractices: (oldIndex: number, newIndex: number) => void;
  setFilter: (filter: Partial<Filter>) => void;
}
```

#### 4. **daily-progress-store.ts**
```typescript
interface DailyProgressState {
  date: string;
  intention: string;
  returnScore: number;
  streakDays: number;
  virtueScores: VirtueScores;
  completedPractices: string[];
  reflectionStatus: ReflectionStatus;
  setIntention: (intention: string) => void;
  togglePractice: (practiceId: string) => void;
  updateVirtueScores: (scores: VirtueScores) => void;
}
```

#### 5. **ui-store.ts**
```typescript
interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}
```

#### 6. **streaming-store.ts**
```typescript
interface StreamingState {
  isStreaming: boolean;
  currentContent: string;
  tokenCount: number;
  error: string | null;
  startStreaming: () => void;
  appendContent: (chunk: string) => void;
  endStreaming: () => void;
  setError: (error: string) => void;
}
```

#### 7. **dashboard-preferences-store.ts** (with persist)
```typescript
interface DashboardPreferencesState {
  widgetOrder: string[];
  visibleWidgets: Record<string, boolean>;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  toggleWidget: (widgetId: string) => void;
}
```

#### 8. **practice-modal-store.ts**
```typescript
interface PracticeModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  practiceId: string | null;
  open: (mode: 'create' | 'edit', practiceId?: string) => void;
  close: () => void;
}
```

#### 9. **persist-utils.ts**
```typescript
// Shared persistence utilities
export const createPersistConfig = (name: string) => ({
  name,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ /* selective persistence */ }),
});
```

### TanStack Query Usage

**Practices Query**:
```typescript
const { data: practices, isLoading } = useQuery({
  queryKey: ['practices'],
  queryFn: async () => {
    const res = await fetch('/api/practices');
    return res.json();
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

**Reflection Mutation**:
```typescript
const createReflection = useMutation({
  mutationFn: async (data: ReflectionInput) => {
    const res = await fetch('/api/reflections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reflections'] });
  },
});
```

---

## AI System Deep Dive

### Provider Abstraction Layer

**Location**: `lib/ai/provider-registry.ts`

**Purpose**: Unified interface for multiple LLM providers with automatic failover.

#### Provider Configuration
```typescript
const providers: AIProvider[] = [
  {
    id: 'openai',
    priority: 1,
    weight: 2,
    client: new OpenAIProvider(),
  },
  {
    id: 'anthropic',
    priority: 2,
    weight: 1,
    client: new AnthropicProvider(),
  },
  {
    id: 'together',
    priority: 3,
    weight: 1,
    client: new TogetherProvider(),
  },
  {
    id: 'ollama',
    priority: 4,
    weight: 1,
    client: new OllamaProvider(),
  },
];
```

#### Health Checking
```typescript
async function checkProviderHealth(provider: AIProvider): Promise<HealthStatus> {
  const cacheKey = `health:${provider.id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const status = await provider.client.getHealthStatus();
    cache.set(cacheKey, status, 30000); // 30s TTL
    return status;
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
}
```

#### Provider Selection
```typescript
async function selectProvider(): Promise<AIProvider> {
  const healthChecks = await Promise.all(
    providers.map(p => checkProviderHealth(p))
  );

  // Filter healthy providers
  const healthy = providers.filter((p, i) =>
    healthChecks[i].status === 'healthy'
  );

  if (healthy.length === 0) {
    // Fallback to degraded providers
    const degraded = providers.filter((p, i) =>
      healthChecks[i].status === 'degraded'
    );
    if (degraded.length === 0) throw new Error('No providers available');
    return degraded[0];
  }

  // Weighted random selection among healthy providers
  return weightedRandom(healthy);
}
```

### RAG Pipeline

**Location**: `lib/ai/retrieval.ts`

**Purpose**: Retrieve relevant philosophy chunks for context-aware coaching.

#### Hybrid Retrieval
```typescript
async function retrieveChunks(
  query: string,
  personaId: string,
  limit: number = 5
): Promise<Chunk[]> {
  const embedding = await embedQuery(query);

  // Vector search (semantic similarity)
  const vectorResults = await supabase
    .from('philosophy_chunks')
    .select('*')
    .gte('embedding <=> $1', embedding) // cosine similarity
    .contains('persona_tags', [personaId])
    .limit(limit * 2); // Over-fetch for reranking

  // Keyword search
  const keywordResults = await supabase
    .from('philosophy_chunks')
    .select('*')
    .textSearch('content', query)
    .contains('persona_tags', [personaId])
    .limit(limit * 2);

  // Combine and rerank
  const combined = mergeDedup(vectorResults.data, keywordResults.data);
  const reranked = rerank(combined, query, personaId);

  return reranked.slice(0, limit);
}
```

#### Reranking Algorithm
```typescript
function rerank(chunks: Chunk[], query: string, personaId: string): Chunk[] {
  return chunks
    .map(chunk => ({
      chunk,
      score: calculateScore(chunk, query, personaId),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ chunk }) => chunk);
}

function calculateScore(chunk: Chunk, query: string, personaId: string): number {
  // Weighted scoring
  const semanticScore = chunk.similarity * 0.35; // 35% weight
  const keywordScore = keywordMatch(chunk.content, query) * 0.20; // 20%
  const personaScore = personaAffinity(chunk, personaId) * 0.40; // 40%
  const recencyScore = recencyBoost(chunk.created_at) * 0.05; // 5%

  return semanticScore + keywordScore + personaScore + recencyScore;
}
```

#### Citation Extraction
```typescript
function extractCitations(content: string, chunks: Chunk[]): Citation[] {
  // Find all [[chunk_id]] markers
  const pattern = /\[\[([^\]]+)\]\]/g;
  const citations: Citation[] = [];

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const chunkId = match[1];
    const chunk = chunks.find(c => c.id === chunkId);
    if (chunk) {
      citations.push({
        id: chunk.id,
        author: chunk.author,
        work: chunk.work,
        section: chunk.section,
        content: chunk.content,
      });
    }
  }

  return citations;
}
```

### Orchestrator & Streaming

**Location**: `lib/ai/orchestrator.ts`

**Purpose**: Coordinate RAG retrieval, prompt building, streaming, and response processing.

#### Chat Flow
```typescript
async function* chat(
  message: string,
  personaId: string,
  userId: string,
  conversationId?: string
): AsyncGenerator<ChatChunk> {
  // 1. Load user context
  const context = await aggregateUserContext(userId);

  // 2. Retrieve relevant chunks
  const chunks = await retrieveChunks(message, personaId);

  // 3. Build prompt
  const prompt = await buildPrompt({
    message,
    personaId,
    context,
    chunks,
    mode: 'coaching', // or 'buddy'
  });

  // 4. Select provider and stream
  const provider = await selectProvider();
  const stream = await provider.client.stream({
    messages: prompt.messages,
    model: prompt.model,
    temperature: prompt.temperature,
  });

  // 5. Stream response
  let fullContent = '';
  for await (const chunk of stream) {
    fullContent += chunk.content;
    yield {
      type: 'content',
      content: chunk.content,
    };
  }

  // 6. Extract citations
  const citations = extractCitations(fullContent, chunks);
  yield {
    type: 'citations',
    citations,
  };

  // 7. Save to database
  await saveMessage({
    conversationId,
    role: 'assistant',
    content: fullContent,
    citations,
    context,
  });
}
```

#### Prompt Building
```typescript
async function buildPrompt(params: PromptParams): Promise<Prompt> {
  const { personaId, message, context, chunks, mode } = params;
  const persona = personas[personaId];

  // System prompt
  const systemPrompt = mode === 'buddy'
    ? buddyModePrompt(persona)
    : coachingModePrompt(persona);

  // Context enrichment
  const contextSection = `
    User Profile:
    - Virtue Focus: ${context.virtues.join(', ')}
    - Current Practices: ${context.practices.map(p => p.name).join(', ')}
    - Recent Reflections: ${context.reflections[0]?.content || 'None'}
    - Return Score: ${context.returnScore}
  `;

  // Knowledge base
  const knowledgeSection = chunks.map(c => `
    [${c.author} - ${c.work}]
    ${c.content}
    [[${c.id}]]
  `).join('\n\n');

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contextSection },
      { role: 'system', content: knowledgeSection },
      { role: 'user', content: message },
    ],
    model: persona.model,
    temperature: persona.temperature,
  };
}
```

### Persona System

**Location**: `lib/ai/personas.ts`

**Persona Configuration**:
```typescript
export const personas: Record<PersonaId, Persona> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus Aurelius',
    title: 'Stoic Strategist',
    tradition: 'stoicism',
    description: 'Roman emperor and Stoic philosopher...',
    voice: 'Measured, commanding, gentle authority',
    virtues: ['wisdom', 'temperance', 'justice', 'courage'],
    practices: [
      'Morning reflection on challenges',
      'Evening review of actions',
      'Premeditatio malorum (negative visualization)',
    ],
    knowledgeTags: ['stoicism', 'marcus', 'meditations'],
    model: 'gpt-4o-mini',
    temperature: 0.7,
    systemPrompt: '...',
  },
  // ... other personas
};
```

**Prompt Templates** (`lib/ai/prompts/coach.ts`):
```typescript
export function buddyModePrompt(persona: Persona): string {
  return `
    You are ${persona.name}, a ${persona.title}.

    Voice: ${persona.voice}
    Tradition: ${persona.tradition}

    Approach:
    - Be warm, conversational, and supportive
    - Share wisdom through stories and examples
    - Ask reflective questions
    - Offer micro-actions when appropriate
    - Include citations using [[chunk_id]] format

    Style:
    - Short paragraphs (2-3 sentences)
    - Use "I" and "you" language
    - End with a thoughtful question or suggestion
  `;
}

export function coachingModePrompt(persona: Persona): string {
  return `
    You are ${persona.name}, a ${persona.title} and philosophical coach.

    Voice: ${persona.voice}
    Tradition: ${persona.tradition}

    Approach:
    - Provide structured guidance and actionable steps
    - Connect user's situation to philosophical principles
    - Offer 1-3 specific micro-actions
    - Include citations using [[chunk_id]] format

    Response Structure:
    1. Acknowledge the user's situation
    2. Share relevant philosophical insight
    3. Provide 1-3 actionable steps
    4. End with encouragement

    Style:
    - Clear, direct language
    - Bulleted action items
    - Mix warmth with practicality
  `;
}
```

---

## Testing Strategy

### Unit/Integration Tests (Jest)

**Location**: `__tests__/`

**Test Files** (11 total):
1. `api/api-logging.test.ts` - API logging utilities
2. `api/health-endpoint.test.ts` - Health check endpoint
3. `lib/analytics-server.test.ts` - Analytics server integration
4. `lib/api-response.test.ts` - API response helpers
5. `lib/coach-prompts.test.ts` - Coach prompt generation
6. `lib/orchestrator.test.ts` - AI orchestrator logic
7. `lib/provider-registry.test.ts` - Provider failover and selection
8. `lib/retrieval.test.ts` - RAG retrieval pipeline
9. `lib/sanitize.test.ts` - Input sanitization
10. `components/providers/__tests__/service-worker-provider.test.tsx`
11. `components/ui/__tests__/button.test.tsx`

**Running Tests**:
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm test -- --coverage      # Coverage report
```

**Example Test**:
```typescript
describe('Provider Registry', () => {
  it('should select healthy provider with highest priority', async () => {
    const provider = await selectProvider();
    expect(provider.id).toBe('openai');
  });

  it('should failover to next provider when primary is down', async () => {
    jest.spyOn(openaiProvider, 'getHealthStatus').mockResolvedValue({
      status: 'unavailable',
    });

    const provider = await selectProvider();
    expect(provider.id).toBe('anthropic');
  });
});
```

### E2E Tests (Playwright)

**Location**: `e2e/specs/`

**Test Suites** (4):
1. `auth.spec.ts` - Authentication flows
2. `coach.spec.ts` - AI coach streaming and responses
3. `dashboard.spec.ts` - Dashboard widgets and practice completion
4. `pwa-offline.spec.ts` - PWA offline functionality

**Running Tests**:
```bash
npm run e2e                 # Run E2E tests
npm run e2e:headed          # Run with browser UI
```

**Example Test**:
```typescript
test('user can complete a practice', async ({ page }) => {
  await page.goto('/today');

  // Find practice widget
  const practice = page.locator('[data-testid="practice-morning-meditation"]');

  // Click to complete
  await practice.click();

  // Verify completion
  await expect(practice).toHaveAttribute('data-completed', 'true');

  // Verify return score updated
  const score = page.locator('[data-testid="return-score"]');
  await expect(score).not.toHaveText('0');
});
```

**Test Utilities** (`e2e/utils/`):
```typescript
// Auth helpers
export async function loginAsUser(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'test-password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/today');
}

// API mocking
export async function mockCoachResponse(page: Page, response: string) {
  await page.route('/api/marcus', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ content: response })}\n\n`,
    });
  });
}
```

### Test Coverage Goals

**Current Coverage**:
- ✅ Core AI system (provider registry, retrieval, orchestrator)
- ✅ API utilities (logging, responses, sanitization)
- ✅ Auth flows (signup, login, session)
- ✅ Dashboard interactions (practice completion, widgets)
- ✅ Coach streaming
- ✅ PWA offline

**Coverage Gaps** (TODO):
- ⚠️ Reflections CRUD
- ⚠️ Practices management (create, edit, archive)
- ⚠️ Payment flows (Stripe checkout, webhooks)
- ⚠️ Admin dashboard operations
- ⚠️ Entitlement management

---

## Development Workflow

### Local Development

```bash
# 1. Start Supabase
npx supabase start

# 2. Run dev server
npm run dev

# 3. Access app
open http://localhost:3001

# 4. Access Supabase Studio
open http://127.0.0.1:55434
```

### Environment Variables

**Required for local dev** (`.env.local`):
```env
# Supabase (custom ports)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55432
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

# AI Providers (optional but needed for coach)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TOGETHER_API_KEY=...
OLLAMA_URL=http://127.0.0.1:11434

# Stripe (optional but needed for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Admin (optional)
ADMIN_DASHBOARD=true
```

### Code Quality Scripts

```bash
# Linting
npm run lint                # Check for issues
npm run lint -- --fix       # Auto-fix issues

# Type checking
npm run typecheck           # TypeScript validation

# Formatting
npm run format              # Check formatting
npm run format:write        # Auto-format code

# Build
npm run build               # Production build
npm run build:analyze       # Bundle size analysis
```

### Database Migrations

**Create migration**:
```bash
npx supabase migration new add_new_column
```

**Edit migration** (`supabase/migrations/YYYYMMDDHHMMSS_add_new_column.sql`):
```sql
ALTER TABLE habits ADD COLUMN difficulty VARCHAR(20) DEFAULT 'medium';
```

**Apply migration**:
```bash
npx supabase db reset  # Local only - resets and runs all migrations
# OR
npx supabase migration up  # Apply pending migrations
```

**Production migrations**:
```bash
# Push to production Supabase project
npx supabase db push
```

### Debugging

**API Route Logging**:
```typescript
import { createLogger } from '@/lib/logging/logger';

export async function GET(request: Request) {
  const logger = createLogger('api/practices');
  logger.info('Fetching practices', { userId: 'abc123' });

  try {
    const data = await fetchPractices();
    logger.info('Practices fetched', { count: data.length });
    return Response.json({ data });
  } catch (error) {
    logger.error('Failed to fetch practices', { error });
    throw error;
  }
}
```

**Server Logs**:
```bash
# View logs from Docker
docker compose logs -f supabase
```

**PostHog Analytics**:
- View events: https://app.posthog.com
- Session replay: https://app.posthog.com/replay

---

## Key Patterns & Conventions

### File Naming
- **React Components**: PascalCase (e.g., `DailyQuote.tsx`)
- **Utilities/Hooks**: kebab-case (e.g., `use-daily-progress.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Types**: `types.ts` or inline with implementation

### Component Patterns

**Server Components** (default in App Router):
```typescript
// app/(dashboard)/today/page.tsx
import { createServerClient } from '@/lib/supabase/server-client';

export default async function TodayPage() {
  const supabase = createServerClient();
  const { data: practices } = await supabase
    .from('habits')
    .select('*')
    .eq('archived', false);

  return <TodayClient practices={practices} />;
}
```

**Client Components**:
```typescript
'use client';

import { usePractices } from '@/lib/hooks/use-practices';

export function PracticeList() {
  const { practices, isLoading } = usePractices();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {practices.map(p => (
        <PracticeCard key={p.id} practice={p} />
      ))}
    </div>
  );
}
```

### API Route Pattern

```typescript
// app/api/practices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { createLogger } from '@/lib/logging/logger';
import { sanitize } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  const logger = createLogger('api/practices');
  const requestId = crypto.randomUUID();

  try {
    const supabase = createServerClient();

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Fetch data (RLS applies automatically)
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('archived', false)
      .order('sort_order');

    if (error) throw error;

    logger.info('Practices fetched', { userId: session.user.id, count: data.length });

    return NextResponse.json({
      data,
      meta: { requestId, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Failed to fetch practices', { error, requestId });
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const logger = createLogger('api/practices');
  const requestId = crypto.randomUUID();

  try {
    const supabase = createServerClient();

    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Parse and sanitize body
    const body = await request.json();
    const sanitized = {
      name: sanitize(body.name),
      virtue: body.virtue,
      frequency: body.frequency,
      // ...
    };

    // Insert (RLS applies automatically)
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...sanitized, user_id: session.user.id })
      .select()
      .single();

    if (error) throw error;

    logger.info('Practice created', { userId: session.user.id, practiceId: data.id });

    return NextResponse.json({
      data,
      meta: { requestId, timestamp: new Date().toISOString() },
    }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create practice', { error, requestId });
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### Zustand Store Pattern

```typescript
// lib/stores/practices-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Practice {
  id: string;
  name: string;
  virtue: string;
  // ...
}

interface PracticesState {
  practices: Practice[];
  filter: { virtue?: string; status?: string };

  // Actions
  setPractices: (practices: Practice[]) => void;
  addPractice: (practice: Practice) => void;
  updatePractice: (id: string, updates: Partial<Practice>) => void;
  deletePractice: (id: string) => void;
  reorderPractices: (oldIndex: number, newIndex: number) => void;
  setFilter: (filter: Partial<PracticesState['filter']>) => void;
}

export const usePracticesStore = create<PracticesState>()(
  persist(
    immer((set) => ({
      practices: [],
      filter: {},

      setPractices: (practices) => set({ practices }),

      addPractice: (practice) => set((state) => {
        state.practices.push(practice);
      }),

      updatePractice: (id, updates) => set((state) => {
        const index = state.practices.findIndex(p => p.id === id);
        if (index !== -1) {
          state.practices[index] = { ...state.practices[index], ...updates };
        }
      }),

      deletePractice: (id) => set((state) => {
        state.practices = state.practices.filter(p => p.id !== id);
      }),

      reorderPractices: (oldIndex, newIndex) => set((state) => {
        const [moved] = state.practices.splice(oldIndex, 1);
        state.practices.splice(newIndex, 0, moved);
      }),

      setFilter: (filter) => set((state) => {
        state.filter = { ...state.filter, ...filter };
      }),
    })),
    {
      name: 'practices-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Custom Hook Pattern

```typescript
// lib/hooks/use-practices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePracticesStore } from '@/lib/stores/practices-store';

export function usePractices() {
  const queryClient = useQueryClient();
  const { practices, setPractices, addPractice, updatePractice, deletePractice } =
    usePracticesStore();

  // Fetch practices
  const { isLoading, error } = useQuery({
    queryKey: ['practices'],
    queryFn: async () => {
      const res = await fetch('/api/practices');
      const json = await res.json();
      setPractices(json.data);
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create mutation
  const create = useMutation({
    mutationFn: async (data: Omit<Practice, 'id'>) => {
      const res = await fetch('/api/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (result) => {
      addPractice(result.data);
      queryClient.invalidateQueries({ queryKey: ['practices'] });
    },
  });

  // Update mutation
  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Practice> }) => {
      const res = await fetch(`/api/practices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      updatePractice(id, updates);
    },
    onError: () => {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['practices'] });
    },
  });

  return {
    practices,
    isLoading,
    error,
    create: create.mutate,
    update: update.mutate,
    // ...
  };
}
```

---

## Known Issues & TODOs

### Critical (Security)

1. **Admin Authorization** 🔴
   - **Location**: `lib/middleware/admin-auth.ts:38`, `app/admin/layout.tsx:26`
   - **Issue**: Admin role checking is currently permissive for development
   - **Action**: Re-enable strict admin verification before production
   ```typescript
   // TODO: Re-enable this check
   // if (!profile?.is_admin) {
   //   return NextResponse.redirect(new URL('/unauthorized', request.url));
   // }
   ```

2. **Admin Audit Logging** 🟡
   - **Location**: `app/api/admin/users/[userId]/route.ts:137`
   - **Issue**: Audit log infrastructure exists but not wired to admin actions
   - **Action**: Implement logging for all admin operations

### High Priority

3. **Revenue Metrics** 🟡
   - **Location**: `app/api/admin/dashboard/route.ts:48`
   - **Issue**: Revenue calculation is placeholder
   - **Action**: Calculate actual revenue from purchases table

4. **CSV Export** 🟡
   - **Location**: `app/admin/entitlements/page.tsx:108`
   - **Issue**: Entitlement export not implemented
   - **Action**: Add CSV generation and download

5. **Toast Notifications** 🟢
   - **Location**: Multiple files (coach workspace, today page)
   - **Issue**: Success/error toasts not implemented
   - **Action**: Add toast notifications for user actions

### Medium Priority

6. **Philosophy Content Expansion** 🟢
   - **Issue**: Corpus exists but needs more coverage
   - **Action**: Follow `docs/philosophy-content-expansion-plan.md`
   - **API Ready**: `/api/ai/ingest` endpoint exists

7. **Test Coverage Expansion** 🟢
   - **Missing**: E2E tests for reflections, practices CRUD, payments, admin
   - **Action**: Add comprehensive E2E coverage

### Low Priority

8. **Service Worker Enhancements** 🟢
   - Background sync for offline actions
   - Push notifications for practice reminders

9. **PWA Install Prompt** 🟢
   - Custom install prompt UI (currently browser default)

10. **Bundle Size Optimization** 🟢
    - Code splitting for admin routes
    - Dynamic imports for heavy components

---

## Deployment

### Local Deployment (Docker)

**Using Docker Compose**:
```bash
# Start all services
docker compose --profile app up --build

# Services included:
# - Next.js app (port 3001)
# - Supabase (Postgres, Auth, Storage, etc.)
# - Redis (optional)
# - Ollama (optional, --profile ollama)

# Access:
# - App: http://localhost:3001
# - Supabase Studio: http://localhost:55434
```

### Staging/Production Deployment

**Recommended Stack**:
- **Frontend**: Vercel (Next.js optimized)
- **Database**: Supabase Cloud (managed Postgres + Auth)
- **Analytics**: PostHog Cloud
- **Payments**: Stripe

**Deployment Checklist** (see `docs/deployment/release-checklist.md`):
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase RLS policies verified
- [ ] Stripe webhooks configured
- [ ] Admin dashboard access restricted
- [ ] Analytics tracking verified
- [ ] Health check endpoint responding
- [ ] Error monitoring configured (Sentry/LogRocket)

**Vercel Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel --prod=false

# Deploy to production
vercel --prod
```

**Environment Variables** (Vercel):
```env
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Admin
ADMIN_DASHBOARD=true  # Only on admin deployment
```

---

## Troubleshooting

### Supabase Won't Start

**Issue**: Ports already in use (Windows WSL)

**Solution**: This repo uses custom ports to avoid conflicts
- Check `supabase/config.toml` for port configuration
- Update `.env.local` with matching ports
- If issues persist, run `npx supabase stop` then `npx supabase start`

### AI Coach Not Responding

**Issue**: Provider unavailable or API key missing

**Solution**:
1. Check `.env.local` has `OPENAI_API_KEY` set
2. Verify provider health: `curl http://localhost:3001/api/health`
3. Check logs: `docker compose logs -f web`
4. Fallback to Ollama: Set `OLLAMA_URL=http://127.0.0.1:11434`

### Database Schema Out of Sync

**Issue**: Migrations not applied

**Solution**:
```bash
# Reset local database (WARNING: deletes data)
npx supabase db reset

# OR apply pending migrations
npx supabase migration up
```

### Authentication Errors

**Issue**: Supabase keys mismatch

**Solution**:
1. Get fresh keys: `npx supabase status`
2. Copy keys to `.env.local`
3. Restart dev server: `npm run dev`

### Build Errors

**Issue**: TypeScript errors or missing dependencies

**Solution**:
```bash
# Clear caches
rm -rf .next node_modules
npm install

# Type check
npm run typecheck

# Fix lint issues
npm run lint -- --fix
```

### Stripe Webhooks Not Working (Local)

**Issue**: Webhook signature verification fails

**Solution**:
1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3001/api/purchases/webhook
   ```
2. Copy webhook secret to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Additional Resources

### Documentation
- **Build Plan**: `docs/build-plan/` - Feature specifications
- **Deployment**: `docs/deployment/` - Runbooks and checklists
- **AI System**: `docs/ai/` - AI provider docs
- **Analytics**: `docs/analytics/` - PostHog dashboards
- **Future Work**: `docs/future-work/` - Enhancement ideas

### External Links
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Playwright](https://playwright.dev/)
- [Jest](https://jestjs.io/)

### Support
- **Issues**: Check `docs/troubleshooting.md`
- **Questions**: Review `docs/build-plan/README.md`
- **Contributing**: Follow patterns in this guide

---

**Last Updated**: October 4, 2025
**Maintained By**: Pocket Philosopher Team
**Version**: 1.0.0 (Production Ready)
