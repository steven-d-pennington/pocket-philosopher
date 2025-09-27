# Supabase Environment Guide

This guide captures the provisioning steps and parity requirements for the Pocket Philosopher Supabase stack across local, staging, and production environments.

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
4. **Enable Row Level Security** (already applied in `schema.sql`) and confirm policies are active via the Dashboard.
5. **Configure auth providers and SMTP** to match environment requirements (email OTP, Resend SMTP credentials, etc.).
6. **Set backups & monitoring**: activate nightly backups, log retention, and connect observability tools (Supabase logs to PostHog/Axiom or your preferred target).

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

- `database/schema.sql` – canonical schema, functions, triggers, and policies.
- `supabase/seed.sql` – idempotent seed data for personas, practice templates, and philosophy corpus snippets.
- `docs/build-plan/tasks/data-and-backend-infrastructure/tasks.md` – execution tracking for backend workstreams.

Update this guide whenever provisioning steps or environment requirements change.
