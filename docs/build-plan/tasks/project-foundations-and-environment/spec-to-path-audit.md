# Spec-to-Repository Path Audit (2025-09-27)

## Summary
- Reviewed build-plan specifications and confirmed each referenced directory or file exists in the repository or has an equivalent implementation.
- No missing paths were identified; a few items received clarifying notes for future contributors.

## Method
1. Parsed build-plan documents to extract explicit path references (directories, routes, scripts, configuration files).
2. Compared each reference against the current filesystem using PowerShell directory listings.
3. Captured alignment notes and follow-ups where the spec mentions future enhancements (e.g., PWA service worker) that do not yet have concrete files.

## Findings
| Spec Doc | Reference | Repository Path | Status | Notes |
| --- | --- | --- | --- | --- |
| project-foundations-and-environment.md | `app/`, `lib/`, `database/`, `public/`, `scripts/` | Root directories | ? | All directories exist with starter content; `scripts/README.md` documents automation entry points. |
| master-scope.md | API routes (`/api/auth`, `/api/practices`, `/api/daily-progress`, `/api/reflections`, `/api/marcus`, `/api/progress`, `/api/ai/*`, `/api/health`, `/api/debug`) | `app/api/*` | ? | Each route folder is present with corresponding Next.js handlers under `app/api`. |
| master-scope.md | Dashboard routes (`(dashboard)/today`, `practices`, `reflections`, `marcus`, `profile`, `settings`, `onboarding`, `help`) | `app/(dashboard)/*` | ? | Route directories exist with page/layout files; streaming chat lives under `(dashboard)/marcus`. |
| frontend-architecture-and-user-experience.md | Metadata helper & analytics provider | `lib/metadata.ts`, `components/providers/analytics-provider.tsx` | ? | Files in place; references align with spec expectations. |
| data-and-backend-infrastructure.md | Schema migrations | `database/schema.sql` | ? | File contains tables, triggers, policies, and vector-enabled corpus table. |
| data-and-backend-infrastructure.md | Seed script reference | `supabase/seed.sql` | ?? | Seed file referenced by Supabase config was missing; created in current work (see backend task notes). |
| data-and-backend-infrastructure.md | Supabase configuration | `supabase/config.toml` | ? | Present with environment defaults; points to `./seed.sql`. |
| analytics-observability-and-security.md | PostHog provider | `components/providers/analytics-provider.tsx` | ? | Implementation matches spec; backend logging tasks remain TODO. |
| deployment-and-operations.md | Docker/local tooling | `scripts/`, `supabase/` | ? | Baseline files exist; full Docker compose remains future work per spec. |
| testing-and-quality-assurance.md | Playwright config | `playwright.config.ts`, `tests/`, `e2e/` | ? | Config and directory scaffolds exist awaiting scenario scripts. |

## Follow-ups
- Track creation of future assets noted as PWA/service worker work (Phase 4 frontend) and structured logging (backend Phase 3); not yet required for spec-to-path parity but flagged as upcoming deliverables.
- Update this audit after major structural changes or when new spec references are introduced.
