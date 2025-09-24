# Pocket Philosopher

Rebuild of the Pocket Philosopher experience: a daily practice hub with habits, reflections, and multi-tradition AI coaches. This repository follows the implementation roadmap captured under docs/build-plan.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project credentials for local development

## Getting Started

1. Copy .env.example to .env.local and populate the required secrets.
2. Install dependencies:
   pm install
3. Run the development server:
   pm run dev
4. Visit [http://localhost:3000](http://localhost:3000) to explore the rebuild workspace.

## Scripts

- pm run dev – start Next.js locally
- pm run build – production build with type checks
- pm run lint – ESLint via flat config
- pm run typecheck – TypeScript without emitting files
- pm run format /
  pm run format:write – Prettier check or write mode
- pm run test – Jest unit/integration suites (setup stubbed)
- pm run e2e – Playwright end-to-end tests (expects local server)

## Repository Layout

- pp/ – App Router routes and layouts
- components/ – shadcn/ui primitives plus feature components (dashboard, habits,
  eflections, marcus, shared)
- lib/ – shared utilities, Zustand stores, hooks, env validation, and fonts
- styles/ – design tokens and Tailwind extensions
- database/ – Supabase schema, migrations, and seeds
- scripts/ – automation entry points (seeding, ingestion, diagnostics)
-     ests/ – cross-feature integration tests (Playwright specs live in 2e/)
- docs/ – build plan and reference materials

For detailed scope and sequencing, start with docs/build-plan/master-scope.md and docs/build-plan/project-foundations-and-environment.md.
