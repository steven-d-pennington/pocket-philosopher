# Playwright End-to-End Tests

The Playwright suite exercises core Pocket Philosopher flows against a running development server and Supabase instance. The fixtures are seeded during Playwright's global setup so that tests remain deterministic across runs.

## Prerequisites
- Supabase CLI installed locally.
- Supabase stack running via `npx supabase start`.
- Database schema applied with `npx supabase db push`.
- Seed content loaded with `psql "$SUPABASE_DB_URL" -f supabase/seed.sql` (or the Supabase Studio SQL editor).
- Environment variables exported in the shell that launches Playwright:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

The service role key is required so the global setup can create/update the deterministic e2e user and associated practice fixtures.

## Running the Suite
1. Ensure `npm install` has been executed.
2. Start Supabase and the database seeds as described above.
3. Run the tests with:
   ```bash
   npm run e2e -- --workers=1 --reporter=line
   ```

The Playwright configuration automatically starts the Next.js dev server (`npm run dev`) unless one is already running on `http://127.0.0.1:3000`.

## Seeded User
The tests authenticate with the seeded user defined in `e2e/utils/test-users.ts`.
- Email: `e2e.marcus@example.com`
- Password: `TestingRocks123!`

The global setup ensures this account exists and resets dashboard data (practices, daily progress, Marcus conversations) before the suite runs.
