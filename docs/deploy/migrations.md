# Applying Supabase Migrations

SQL migrations live in `supabase/migrations/` and must be applied to the
Supabase project before the app can rely on the new schema.

## Option 1: Supabase CLI (recommended)

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) to be
installed and the local project linked to the remote one.

```bash
# One-time setup
supabase login
supabase link --project-ref <your-project-ref>

# Push every new migration under supabase/migrations/
supabase db push
```

`supabase db push` is idempotent — migrations that have already been applied
are skipped.

## Option 2: Dashboard SQL editor (no CLI)

For quick hotfixes or environments where the CLI is unavailable:

1. Open the Supabase Dashboard and select the project.
2. Go to **SQL Editor → New query**.
3. Paste the contents of the migration file (e.g.
   `supabase/migrations/20260419_login_attempts.sql`).
4. Click **Run** and confirm there are no errors.
5. Verify the table appears under **Database → Tables**.

## Required environment variables

After a migration that introduces server-side tables, double-check that the
deployment target (Netlify, Vercel, etc.) has:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never expose to the client

The service-role key is found under **Project Settings → API** in the
Supabase Dashboard.

## Notes on `pg_cron`

Some migrations schedule background jobs via `pg_cron`. `pg_cron` is enabled
on all Supabase projects by default, but the schedule call requires the
`postgres` superuser — running the migration through the Dashboard SQL editor
or `supabase db push` satisfies this. If the `select cron.schedule(...)` step
fails, remove it and create the schedule manually from the Dashboard under
**Database → Extensions → pg_cron**.
