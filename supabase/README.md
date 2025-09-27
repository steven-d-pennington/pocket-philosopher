# Supabase Environment Guide

This guide captures the provisioning steps, authentication configuration, and parity requirements for the Pocket Philosopher Supabase stack across local, staging, and production environments.

## Environments

| Environment | Project Name | Notes |
| --- | --- | --- |
| Local | `pocket-philosopher-local` | Launched with the Supabase CLI; reads secrets from your shell/.env.local. |
| Staging | `pocket-philosopher-staging` | Mirrors production schema for pre-release verification. Configure restricted service role keys in your hosting provider. |
| Production | `pocket-philosopher` | Live workload. Enable backups, log retention, and monitoring integrations. |

> Update the project names if your Supabase organization uses different identifiers.

## Provisioning Checklist

1. **Create projects** in the Supabase Dashboard for staging and production. Record each project URL and anon/service_role key in your secrets manager.
2. **Apply the schema** by running `database/schema.sql` via the Supabase SQL editor or `supabase db push` for the CLI-managed local project.
3. **Run the seed script** to populate practice templates, persona metadata, and initial philosophy corpus records:
   ```bash
   npx supabase db reset        # optional for local
   npx supabase db push         # apply schema locally
   npx supabase db remote commit --project-ref <project-ref>  # staging/production (if using CLI-managed migrations)
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql              # or run within the SQL editor
   ```
4. **Confirm Row Level Security** (policies are defined in `database/schema.sql`). See "RLS Verification" below for suggested checks.
5. **Configure authentication** (email OTP, Resend SMTP credentials, optional OAuth providers). Instructions in "Authentication Providers" below.
6. **Set backups & monitoring**: activate nightly backups, log retention, and connect observability tools. See "Backups & Monitoring" for recommended settings.

## Authentication Providers

1. Navigate to **Settings > Authentication > Providers** in the Supabase Dashboard.
2. Enable **Email** sign-in and configure SMTP settings. Recommended setup:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: use your `RESEND_API_KEY`
   - Sender: value of `EMAIL_FROM` (must be a verified domain in Resend).
3. Optional OAuth providers (Google, Apple, etc.) can be toggled here. Record client IDs/secrets in your secrets manager and map them to Supabase when ready.
4. Under **Authentication > Policies**, set **Disable anonymous sign-ups** unless the product explicitly requires them.
5. Configure **Rate limits** for email and OTP endpoints to guard against abuse (Authentication > Rate limits > Email). Suggested starter: 20 requests / 5 minutes per IP.

## RLS Verification

The schema already enables RLS on all user-owned tables. After applying migrations, run these checks:

```sql
-- Should return `permissive` policies when RLS is active
select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in (
  'profiles','habits','habit_logs','reflections','daily_progress','progress_summaries','marcus_conversations','marcus_messages','feedback'
);

-- Verify a sample policy
select *
from pg_policies
where schemaname = 'public' and tablename = 'habits';
```

If `rowsecurity` is `t` and policies exist per table, RLS is configured correctly. Test Supabase client interactions with a limited JWT to ensure policies behave as expected.

## Backups & Monitoring

1. **Backups**
   - Dashboard > Database > Backups: enable **Daily Backups** (retain 7-14 days).
   - Configure **Point-in-time Recovery** if on a paid plan.
   - Export weekly dumps with `supabase db dump --project-ref <ref>` and archive to cloud storage (S3/GCS).
2. **Log Retention & Alerts**
   - Dashboard > Logs > Settings: set retention to at least 30 days for staging and 90 days for production.
   - Create alert rules for auth failures, rate-limit breaches, and storage errors. Alerts can be sent to Slack/email via Supabase Logflare or webhook integrations.
3. **Monitoring Integrations**
   - Enable the built-in **Performance** dashboard and configure the **Edge Functions** inspector if applicable.
   - Forward logs to your observability stack (e.g., PostHog, Axiom, Datadog). Use the `Log drains` feature under Logs to ship structured logs.
   - Record environment URLs and alert contacts in your runbook.
4. **Health Checks**
   - Ensure `/api/health` in the Next.js app is monitored by your uptime service. Add Supabase connectivity checks to that endpoint as additional validation.

## Environment Parity & Secrets

- `.env.local` mirrors the keys required in staging/production (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Store service role keys in secure backends only (e.g., Vercel server-side, GitHub Actions secrets). Never expose them to the client bundle.
- Keep PostHog, AI provider, and Resend keys consistent between staging and production to ensure behavior parity.

## Local Development

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and start the stack:
   ```bash
   npx supabase start
   ```
2. Ensure the CLI session has access to `.env.local` variables (export or pass via `--env-file`).
3. Run migrations and seeds:
   ```bash
   npx supabase db push
   psql "postgres://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed.sql
   ```
4. Access Supabase Studio at [http://127.0.0.1:54323](http://127.0.0.1:54323) to verify data.

## Staging & Production Operations

- Schedule recurring `supabase db dump` exports and store them in your cloud backup bucket.
- Mirror the `supabase/config.toml` settings where applicable (ports differ locally, but feature toggles should remain consistent).
- Document connection strings and credentials in your internal runbook; do not commit them to this repository.

## Related Files

- `database/schema.sql` - canonical schema, functions, triggers, and policies.
- `supabase/seed.sql` - idempotent seed data for personas, practice templates, and philosophy corpus snippets.
- `docs/build-plan/tasks/data-and-backend-infrastructure/tasks.md` - execution tracking for backend workstreams.

Update this guide whenever provisioning steps or environment requirements change.




