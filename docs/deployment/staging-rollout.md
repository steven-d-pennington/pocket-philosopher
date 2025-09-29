# Staging Rollout Guide

This guide documents the steps to promote Pocket Philosopher changes into the staging environment with confidence and explicit rollback plans.

## Prerequisites

- Access to the staging Supabase project and dashboard
- Access to Vercel (or the hosting platform) with rights to trigger deployments
- Access to the monitoring stack (PostHog, logs)

## 1. Prepare the Release

1. **Verify telemetry pipelines**
   - Confirm `i_chat_completed`, `i_request_failed`, and `i_provider_health_changed` events are visible in PostHog with fresh timestamps.
   - Run `npm run test` and `npm run lint` locally.
2. **Sync database migrations**
   - Review pending SQL files under `supabase/migrations`.
   - Run migrations against staging using the Supabase CLI:
     ```bash
     supabase db push --project-ref <staging-ref>
     ```
   - Record the migration IDs in the release checklist.
3. **Update secrets**
   - Ensure staging has the latest keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`, `POSTHOG_API_KEY`, `RESEND_API_KEY`, and Redis connection strings.
   - Cross-check Supabase service role keys and Next.js environment variables in the hosting dashboard.

## 2. Deploy Application Code

1. Merge the release branch into `main` (or the staging target branch).
2. Trigger a deployment through the hosting provider (e.g., Vercel). Record the deployment URL and timestamp.
3. Monitor the build logs for PostgREST/GoTrue connection success messages.

## 3. Validate After Deploy

1. **Smoke test the app**
   - Load <https://staging.pocketphilosopher.app> and ensure the dashboard renders.
   - Trigger an AI coach session and confirm streaming output with citations.
   - Run `npx playwright test e2e/specs/pwa-offline.spec.ts` against the staging URL to confirm service worker install prompts,
     cached fonts, and offline routing.
2. **Inspect health endpoints**
   - Hit `/api/health` and verify provider statuses and Supabase connectivity.
3. **Check background services**
   - Ensure Redis metrics show the expected connection count.
   - Verify Supabase Studio reflects the latest schema.
4. **Observe telemetry**
   - Confirm new `i_chat_completed` events in PostHog with staging distinct IDs.

## 4. Rollback Strategy

1. Revert to the previous deployment in the hosting provider UI.
2. Re-run Supabase migrations with `supabase db remote commit <migration-id>` if a schema rollback is required.
3. Restore backups:
   - Supabase automated backups can be restored via the dashboard.
   - Redis caches can be flushed with `redis-cli FLUSHALL` if stale data persists.
4. Announce the rollback in the engineering Slack channel with links to the reverted deployment and issue tracker tickets.

## 5. Release Log Template

| Field | Notes |
| ----- | ----- |
| Release Date | |
| Git SHA | |
| Migrations Applied | |
| Feature Highlights | |
| Manual Tests | |
| Post-Deploy Monitoring Links | |
| Rollback Trigger (if used) | |

Maintain the filled-out table in the team knowledge base for auditability.
