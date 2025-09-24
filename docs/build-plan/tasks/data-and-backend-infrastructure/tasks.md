# Data & Backend Infrastructure — Task Plan

## Phase 1: Supabase Provisioning & Governance
1. Stand up Supabase projects for local, staging, and production; document connection details and environment parity requirements.
2. Apply schema migrations (`database/schema.sql` and RAG-related files) and verify table structures, indexes, and extensions.
3. Enable authentication providers, configure RLS policies, and establish automated backups plus monitoring hooks. [P]

## Phase 2: Database Automations & Seed Data
1. Implement and validate stored procedures, triggers, and scheduled tasks (e.g., `calculate_daily_progress`, `recalculate_progress_on_habit_log_change`).
2. Define index and policy optimization backlog to ensure performance across habit, reflection, and analytics queries. [P]
3. Build idempotent seed scripts for habit templates, persona metadata, and philosophy corpus starters; run against all environments.

## Phase 3: API Platform Foundation
1. Develop `withAuthAndRateLimit` middleware, Supabase client factories, validation schemas, sanitization helpers, and shared response formatters.
2. Integrate structured logging and metrics instrumentation consistent with observability guidelines. [P]
3. Configure error handling conventions, including retry headers for rate-limit breaches and standardized error payloads. [P]

## Phase 4: API Route Implementation
1. Implement `auth`, `profile`, and `daily-progress` routes covering login flows, profile management, and morning intention updates.
2. Deliver `habits`, `progress`, and `reflections` routes with action-based payloads, optimistic updates, and analytics aggregation.
3. Build `marcus` and `ai/*` endpoints coordinating with the AI orchestration layer, including streaming support and admin tooling.
4. Finalize `health` and `debug` routes with comprehensive diagnostics and secure admin access pathways. [P]
