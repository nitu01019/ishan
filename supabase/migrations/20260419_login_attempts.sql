create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_time_idx on public.login_attempts(ip, attempted_at desc);
alter table public.login_attempts enable row level security;
-- Zero policies = service_role only (bypasses RLS); anon + authenticated blocked.
-- Cleanup job (requires pg_cron extension):
create extension if not exists pg_cron;
select cron.schedule(
  'login_attempts_cleanup',
  '0 * * * *',
  $$delete from public.login_attempts where attempted_at < now() - interval '24 hours'$$
);
