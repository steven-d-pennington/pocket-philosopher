-- Add admin tables for dashboard functionality

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  ip_address inet,
  user_agent text,
  last_activity_at timestamptz default now() not null,
  expires_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_data jsonb not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  timestamp timestamptz default now() not null,
  processed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null, -- 'philosophy_chunk', 'coach_persona', etc.
  content_id text not null, -- ID of the content being versioned
  version_number integer not null,
  title text,
  content jsonb not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  change_summary text,
  is_published boolean default false,
  created_at timestamptz default now() not null,
  constraint content_versions_unique_content_version unique (content_type, content_id, version_number)
);

create table if not exists public.system_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null, -- 'performance', 'error', 'usage', etc.
  metric_name text not null,
  metric_value numeric not null,
  unit text, -- 'ms', 'count', 'percentage', etc.
  tags jsonb default '{}'::jsonb,
  timestamp timestamptz default now() not null,
  retention_days integer default 90
);

-- Add updated_at trigger for admin_sessions
drop trigger if exists set_updated_at_admin_sessions on public.admin_sessions;
create trigger set_updated_at_admin_sessions
  before update on public.admin_sessions
  for each row
  execute procedure public.set_updated_at();

-- Enable RLS on admin tables
alter table public.admin_sessions enable row level security;

create policy "Admins can manage admin sessions"
  on public.admin_sessions
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

alter table public.analytics_events enable row level security;

create policy "Admins can view analytics events"
  on public.analytics_events
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "System can insert analytics events"
  on public.analytics_events
  for insert
  with check (true);

alter table public.content_versions enable row level security;

create policy "Admins can manage content versions"
  on public.content_versions
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

alter table public.system_metrics enable row level security;

create policy "Admins can view system metrics"
  on public.system_metrics
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "System can insert system metrics"
  on public.system_metrics
  for insert
  with check (true);

-- Admin indexes
create index if not exists idx_admin_sessions_admin_user on public.admin_sessions (admin_user_id, is_active) where is_active = true;
create index if not exists idx_admin_sessions_token on public.admin_sessions (session_token) where is_active = true;
create index if not exists idx_analytics_events_type_timestamp on public.analytics_events (event_type, timestamp desc);
create index if not exists idx_analytics_events_user on public.analytics_events (user_id, timestamp desc);
create index if not exists idx_content_versions_content on public.content_versions (content_type, content_id, version_number desc);
create index if not exists idx_system_metrics_type_timestamp on public.system_metrics (metric_type, metric_name, timestamp desc);