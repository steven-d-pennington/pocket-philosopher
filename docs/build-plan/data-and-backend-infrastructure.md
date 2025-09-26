# Data & Backend Infrastructure

## 1. Supabase Provisioning
- Create the Supabase project and configure environments (local, staging, production).
- Run schema migrations from `database/schema.sql` and any additional RAG-related migrations.
- Enable Row Level Security (RLS) and configure authentication providers.
- Set up backups, monitoring, and observability hooks per specifications.

## 2. Database Automations
- Implement Supabase functions and triggers, including `calculate_daily_progress` and `recalculate_progress_on_habit_log_change`.
- Add indexes and policies to support performance and security requirements.
- Document automation logic and establish processes for future migrations.

## 3. Seed Data
- Populate practice templates, persona metadata, and initial philosophy corpus records.
- Create ingestion utilities or scripts to support ongoing dataset updates.
- Ensure seed scripts are idempotent and usable across environments.

## 4. API Middleware & Utilities
- Develop `withAuthAndRateLimit` middleware for consistent auth and throttling.
- Build Supabase client factories, Zod validation schemas, sanitization helpers, and standardized response formatters.
- Integrate logging and metrics hooks to support observability.

## 5. API Routes Implementation
- Implement API endpoints for `auth`, `profile`, `practices`, `daily-progress`, `progress`, `reflections`, `marcus`, `ai/*`, `health`, and `debug`.
- Apply documented behaviors, rate limits, and payload contracts across endpoints.
- Ensure robust error handling and response messaging.

