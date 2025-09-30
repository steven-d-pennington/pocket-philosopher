# Production Deployment Runbook

This runbook outlines the end-to-end process for promoting Pocket Philosopher to production, including verification, observability, and rollback.

## 1. Pre-Flight Checklist

- [ ] Release candidate has soaked in staging for at least 24 hours.
- [ ] All automated pipelines (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run e2e`) are green.
- [ ] Staging metrics show stable `i_chat_completed` vs `i_request_failed` ratios.
- [ ] On-call engineer is aware of the deployment window.

## 2. Secure Credentials & Configuration

1. Export the staging `.env` secrets and compare with production values.
2. Confirm the following are up-to-date in the production secret manager:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TOGETHER_API_KEY`
   - `RESEND_API_KEY`
   - `POSTHOG_API_KEY`
   - Redis connection URL and credentials
3. Validate Supabase backups are scheduled and succeeded within the last 24 hours.

## 3. Deploy Application Artifacts

1. Create a Git tag for the release, e.g. `v2024.04.15`.
2. Trigger the production build via CI/CD or the hosting provider dashboard.
3. Monitor build logs and confirm environment variables injected at runtime match expectations.
4. Once live, capture the deployment URL and commit SHA in the release channel.

## 4. Post-Deployment Verification

1. Run targeted smoke tests:
   ```bash
   npm run test -- __tests__/health-endpoint.test.ts
   npm run test -- __tests__/retrieval.test.ts
   ```
2. Manually load <https://app.pocketphilosopher.com> and:
   - Authenticate and load the dashboard with PWA install banner
   - Initiate a coach session, confirming streaming content, inline citations, and offline fallback messaging
   - Test PWA installation and offline functionality
   - Execute `PLAYWRIGHT_BASE_URL=https://app.pocketphilosopher.com npx playwright test e2e/specs/pwa-offline.spec.ts` to sanity-check the service worker, cached fonts, and offline route
3. Query `/api/health` and ensure all providers report `healthy` or `degraded` (no `unavailable`).
4. Inspect Redis monitoring to verify connection counts and memory usage.
5. Check PostHog for real-time `i_request_failed` anomalies.

## 5. Observability Hooks

- Log stream: `kubectl logs` or hosting provider console for structured provider metrics.
- PostHog dashboards: AI Telemetry, Offline Interactions.
- Supabase logs: confirm new migrations applied without errors.
- Workbox service worker: confirm `SKIP_WAITING` updates via browser devtools.

## 6. Rollback Procedure

1. Revert to the previous deployment in the hosting provider UI (Vercel, Fly.io, etc.).
2. If database changes must be undone, apply the down migrations or restore from the latest backup snapshot.
3. Flush Redis caches if stale persona data is suspected: `redis-cli -u <redis-url> FLUSHALL`.
4. Notify the team in the incident channel with the root cause summary and follow-up actions.

## 7. Post-Deploy Follow-Up

- Update the release log with:
  - Date/time
  - Git SHA
  - Operator(s)
  - Links to dashboards or alerts reviewed
- Schedule a retrospective if any customer-facing incidents occurred.

Keep this document updated as new infrastructure or telemetry tools are introduced.
