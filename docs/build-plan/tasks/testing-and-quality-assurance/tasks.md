# Testing & Quality Assurance — Task Plan

## Phase 1: Automated Testing Foundations
1. ✅ [Complete] Configure Jest for unit and integration coverage across stores, hooks, API routes, and AI modules, including module mocks and shared fixtures. Client-side suites now run under a dedicated jsdom project while Node-oriented helpers execute in an isolated server project with environment polyfills and teardown helpers so analytics clients shut down cleanly.
2. ✅ [Complete] Stand up Playwright end-to-end suites covering auth, onboarding, habit logging, reflections, coach chat, and offline scenarios. All 4 test suites implemented:
   - e2e/specs/auth.spec.ts - Authentication flows
   - e2e/specs/dashboard.spec.ts - Dashboard functionality
   - e2e/specs/coach.spec.ts - AI coach interactions
   - e2e/specs/pwa-offline.spec.ts - PWA offline capabilities
3. ✅ [Complete] Establish reusable testing utilities (factories, Supabase seeders, mock AI providers) to streamline scenario creation. [P]

## Phase 2: AI Evaluation Harness
1. Build regression harness validating persona adherence, citation accuracy, and output formatting for AI responses.
2. Integrate evaluation runs into CI with thresholds that gate merges; document remediation procedures for failures. [P]
3. Monitor evaluation metrics over time and maintain a backlog of prompt or retrieval adjustments informed by results. [P]

## Phase 3: CI/CD Integration
1. ⏸️ [Not Started] Configure CI pipelines to run linting, type checks, unit tests, Playwright suites, and AI evaluations on pull requests and main branch builds. (.github/workflows/ directory does not exist)
2. ⏸️ [Not Started] Prepare deployment automation scripts for Vercel/Fly.io with environment promotion checks and rollback hooks. [P]
3. ⏸️ [Not Started] Establish notification channels (Slack/email) for build failures, flaky test reports, and evaluation regressions; document escalation flows. [P]

