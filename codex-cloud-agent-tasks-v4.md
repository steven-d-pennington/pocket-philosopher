# Cloud Agent Task Brief — Testing Foundations v4

## Context Snapshot
- Jest scaffolding now loads env defaults and cleanup helpers; server-side smoke tests exist for logging, provider registry, and health endpoint.
- No Playwright specs exist; 
pm run e2e simply invokes the default Playwright runner.
- Local onboarding via Docker Compose is available (docker-compose.yml, docs/deployment/local-onboarding.md).

## Mission
Bootstrap the initial Playwright end-to-end suite with deterministic fixtures so we can exercise core flows (auth gates, today dashboard, coach streaming) against the running dev server.

### 1. Playwright Project Setup
- Update playwright.config.ts with:
  - Base URL from PLAYWRIGHT_BASE_URL env (default to http://127.0.0.1:3000).
  - Global 	estDir such as e2e/specs.
  - Workers/timeouts tuned for dev (e.g., 1 worker, 30s timeout) for now.
- Add a global setup that seeds Supabase via REST or SQL fixture (if seeding is heavy, mock minimal data via API calls at test start).

### 2. Auth Smoke Tests
- Implement e2e/specs/auth.spec.ts that verifies:
  1. Visiting /login (or root redirect) shows sign-in form.
  2. Submitting valid credentials from seeded user logs in and redirects to dashboard.
  3. Protected routes redirect to login when not authenticated.
- Rely on Supabase local REST or CLI seeding for the test user; document how to run supabase start + seeding before e2e tests.

### 3. Dashboard & Coach Flow
- Add e2e/specs/dashboard.spec.ts covering:
  - Today view renders intention form and practice list.
  - Completing a practice updates the UI state (check for toast or button state change).
- Add e2e/specs/coach.spec.ts to verify opening the Marcus coach, sending a prompt, and receiving streaming chunks (mock the AI providers by intercepting /api/marcus response).

### 4. Test Utilities
- Create e2e/utils/test-users.ts (or similar) to store seeded credentials.
- Provide helper for Supabase sign-in via API (e.g., POST /api/auth) so tests can authenticate without UI when needed.

### 5. Documentation
- Update docs/build-plan/tasks/testing-and-quality-assurance/tasks.md to mark Playwright work as started and list the initial specs.
- Extend docs/build-plan/tasks/summary-2025-09-27.md with the new testing progress and instructions for running e2e (
pm run e2e).
- Add a short README under e2e/ describing prerequisites (Supabase running, seeded data).

### 6. Validation
- Ensure 
pm run lint, 
pm run typecheck, and 
pm run e2e -- --workers=1 --reporter=line --passWithNoTests (or equivalent) pass in CI mode.

## Constraints
- Keep tests deterministic; mock AI responses instead of relying on live providers.
- Use Playwright’s built-in fixtures (no new deps) and capture screenshots/videos on failure.
- Preserve compatibility with Docker Compose workflow (document how to expose the running server for Playwright).

Deliver the work on a feature branch and flag when it’s ready for merge so we can build on top of the e2e baseline.
