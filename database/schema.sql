-- Pocket Philosopher core schema
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_virtue text,
  preferred_persona text,
  experience_level text,
  daily_practice_time time,
  timezone text default 'UTC',
  notifications_enabled boolean default true,
  blended_coach_chats boolean default false,
  privacy_level text default 'private',
  onboarding_complete boolean default false,
  last_active_at timestamptz,
  is_admin boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  virtue text not null,
  tracking_type text default 'boolean',
  target_value numeric,
  difficulty_level text,
  frequency text default 'daily',
  active_days smallint[] default '{1,2,3,4,5,6,7}',
  reminder_time time,
  is_active boolean default true,
  is_archived boolean default false,
  sort_order integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  value numeric,
  target_value numeric,
  notes text,
  mood_before text,
  mood_after text,
  difficulty_felt text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint habit_logs_unique_per_day unique (user_id, habit_id, date)
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('morning', 'midday', 'evening')),
  virtue_focus text,
  intention text,
  lesson text,
  gratitude text,
  challenge text,
  mood integer,
  journal_entry text,
  key_insights text[] default '{}',
  challenges_faced text[] default '{}',
  wins_celebrated text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint reflections_unique_per_type unique (user_id, date, type)
);

create table if not exists public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  morning_intention text,
  habits_completed integer default 0,
  completion_rate numeric,
  return_score numeric,
  streak_days integer default 0,
  wisdom_score numeric,
  justice_score numeric,
  temperance_score numeric,
  courage_score numeric,
  morning_reflection_complete boolean default false,
  evening_reflection_complete boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint daily_progress_unique_day unique (user_id, date)
);

create table if not exists public.progress_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  avg_return_score numeric,
  most_consistent_virtue text,
  streak_days integer,
  habits_completed integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint progress_summaries_unique_period unique (user_id, period_type, period_start)
);

create table if not exists public.marcus_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  context_type text,
  virtue_focus text,
  active_persona text,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.marcus_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.marcus_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  persona_id text,
  user_context jsonb,
  ai_reasoning jsonb,
  citations jsonb,
  message_order integer,
  created_at timestamptz default now() not null
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean default false,
  updated_at timestamptz default now() not null
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text,
  priority text,
  title text,
  description text,
  metadata jsonb default '{}'::jsonb,
  status text default 'open',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Monetization tables
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  price_cents integer not null,
  currency text default 'usd',
  product_type text not null check (product_type in ('coach', 'subscription', 'bundle')),
  persona_id text,
  stripe_price_id text,
  is_active boolean default true,
  sort_order integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text default 'usd',
  status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  purchase_date timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint purchases_unique_session unique (stripe_session_id)
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  purchase_id uuid references public.purchases(id) on delete set null,
  entitlement_type text not null check (entitlement_type in ('coach_access', 'subscription', 'lifetime')),
  is_active boolean default true,
  source text default 'stripe' check (source in ('stripe', 'manual_grant', 'promo', 'beta')),
  granted_at timestamptz default now() not null,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint entitlements_unique_user_product unique (user_id, product_id)
);

create table if not exists public.philosophy_chunks (
  id uuid primary key default gen_random_uuid(),
  work text not null,
  author text,
  tradition text,
  section text,
  virtue text,
  persona_tags text[],
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Admin tables
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now() not null
);

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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- updated_at triggers

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_habits on public.habits;
create trigger set_updated_at_habits
  before update on public.habits
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_habit_logs on public.habit_logs;
create trigger set_updated_at_habit_logs
  before update on public.habit_logs
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_reflections on public.reflections;
create trigger set_updated_at_reflections
  before update on public.reflections
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_daily_progress on public.daily_progress;
create trigger set_updated_at_daily_progress
  before update on public.daily_progress
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_progress_summaries on public.progress_summaries;
create trigger set_updated_at_progress_summaries
  before update on public.progress_summaries
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_marcus_conversations on public.marcus_conversations;
create trigger set_updated_at_marcus_conversations
  before update on public.marcus_conversations
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_app_settings on public.app_settings;
create trigger set_updated_at_app_settings
  before update on public.app_settings
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_admin_audit_log on public.admin_audit_log;
create trigger set_updated_at_admin_audit_log
  before update on public.admin_audit_log
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_admin_sessions on public.admin_sessions;
create trigger set_updated_at_admin_sessions
  before update on public.admin_sessions
  for each row
  execute procedure public.set_updated_at();

create or replace function public.calculate_daily_progress(target_user uuid, target_date date)
returns void as $$
begin
  update public.daily_progress dp
     set
       habits_completed = coalesce(calc.completed, 0),
       completion_rate = coalesce(calc.completion_rate, 0),
       return_score = coalesce(calc.return_score, dp.return_score),
       streak_days = coalesce(calc.streak_days, 0),
       wisdom_score = coalesce(calc.wisdom_score, 0),
       justice_score = coalesce(calc.justice_score, 0),
       temperance_score = coalesce(calc.temperance_score, 0),
       courage_score = coalesce(calc.courage_score, 0),
       updated_at = now()
  from (
    select
      count(*) as completed,
      avg(case when hl.target_value is null or hl.target_value = 0 then 1 else least(1, hl.value / hl.target_value) end) as completion_rate,
      avg(coalesce(hl.value, 0)) as return_score,
      -- Calculate streak: consecutive days with activity (habits or reflections)
      (
        select count(*) from (
          select date from (
            select distinct date
            from public.habit_logs
            where user_id = target_user and date <= target_date
            union
            select distinct date
            from public.reflections
            where user_id = target_user and date <= target_date
          ) dates
          order by date desc
        ) consecutive_dates
        where date >= (
          select min(streak_start) from (
            select date as streak_start
            from (
              select distinct date
              from public.habit_logs
              where user_id = target_user and date <= target_date
              union
              select distinct date
              from public.reflections
              where user_id = target_user and date <= target_date
            ) activity_dates
            order by date desc
            limit 1
          ) latest_activity
          where not exists (
            select 1
            from (
              select distinct date
              from public.habit_logs
              where user_id = target_user and date <= target_date
              union
              select distinct date
              from public.reflections
              where user_id = target_user and date <= target_date
            ) all_dates
            where all_dates.date between latest_activity.streak_start - interval '1 day' and target_date
            and all_dates.date not in (
              select distinct date
              from public.habit_logs
              where user_id = target_user and date <= target_date
              union
              select distinct date
              from public.reflections
              where user_id = target_user and date <= target_date
            )
          )
        )
      ) as streak_days,
      -- Calculate virtue scores based on habit completions over past 7 days
      (
        select avg(case when h.virtue = 'wisdom' then coalesce(hl.value, 1) else 0 end)
        from public.habit_logs hl
        join public.habits h on hl.habit_id = h.id
        where hl.user_id = target_user
        and hl.date between target_date - interval '6 days' and target_date
      ) as wisdom_score,
      (
        select avg(case when h.virtue = 'justice' then coalesce(hl.value, 1) else 0 end)
        from public.habit_logs hl
        join public.habits h on hl.habit_id = h.id
        where hl.user_id = target_user
        and hl.date between target_date - interval '6 days' and target_date
      ) as justice_score,
      (
        select avg(case when h.virtue = 'temperance' then coalesce(hl.value, 1) else 0 end)
        from public.habit_logs hl
        join public.habits h on hl.habit_id = h.id
        where hl.user_id = target_user
        and hl.date between target_date - interval '6 days' and target_date
      ) as temperance_score,
      (
        select avg(case when h.virtue = 'courage' then coalesce(hl.value, 1) else 0 end)
        from public.habit_logs hl
        join public.habits h on hl.habit_id = h.id
        where hl.user_id = target_user
        and hl.date between target_date - interval '6 days' and target_date
      ) as courage_score
    from public.habit_logs hl
    where hl.user_id = target_user
      and hl.date = target_date
  ) as calc
  where dp.user_id = target_user and dp.date = target_date;
end;
$$ language plpgsql;

create or replace function public.recalculate_progress_on_habit_log_change()
returns trigger as $$
begin
  perform public.calculate_daily_progress(coalesce(new.user_id, old.user_id), coalesce(new.date, old.date));
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists habit_logs_recalculate_progress on public.habit_logs;
create trigger habit_logs_recalculate_progress
  after insert or update or delete on public.habit_logs
  for each row execute procedure public.recalculate_progress_on_habit_log_change();

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.reflections enable row level security;
alter table public.daily_progress enable row level security;
alter table public.progress_summaries enable row level security;
alter table public.marcus_conversations enable row level security;
alter table public.marcus_messages enable row level security;
alter table public.feedback enable row level security;

create policy "Users manage their profile"
  on public.profiles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage habits"
  on public.habits
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage habit logs"
  on public.habit_logs
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage reflections"
  on public.reflections
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage daily progress"
  on public.daily_progress
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage progress summaries"
  on public.progress_summaries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage conversations"
  on public.marcus_conversations
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage messages"
  on public.marcus_messages
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users submit feedback"
  on public.feedback
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid() or user_id is null);

-- Monetization RLS policies
create policy "Products are viewable by everyone"
  on public.products
  for select
  using (is_active = true);

create policy "Users manage their purchases"
  on public.purchases
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their entitlements"
  on public.entitlements
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin RLS policies
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (auth.uid() is not null);  -- TEMP: Allow all authenticated users to view profiles for admin functionality

create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (auth.uid() is not null)  -- TEMP: Allow all authenticated users to update profiles for admin functionality
  with check (auth.uid() is not null);

create policy "Admins can view all purchases"
  on public.purchases
  for select
  using (auth.uid() is not null);  -- TEMP: Allow all authenticated users to view purchases for admin functionality

create policy "Admins can view all entitlements"
  on public.entitlements
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can manage entitlements"
  on public.entitlements
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

create policy "Admins can manage admin audit log"
  on public.admin_audit_log
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

alter table public.admin_audit_log enable row level security;

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

comment on function public.calculate_daily_progress is 'Recalculate Return Score, streaks, and virtue metrics for a given day.';
-- Helpful indexes
create index if not exists idx_habits_user_active on public.habits (user_id) where is_active and not is_archived;
create index if not exists idx_habit_logs_user_date on public.habit_logs (user_id, date desc);
create index if not exists idx_reflections_user_date on public.reflections (user_id, date desc);
create index if not exists idx_daily_progress_user_date on public.daily_progress (user_id, date desc);
create index if not exists idx_marcus_messages_conversation on public.marcus_messages (conversation_id, created_at);

-- Monetization indexes
create index if not exists idx_purchases_user_status on public.purchases (user_id, status, purchase_date desc);
create index if not exists idx_entitlements_user_active on public.entitlements (user_id, is_active) where is_active = true;
create index if not exists idx_entitlements_user_product on public.entitlements (user_id, product_id);

-- Admin indexes
create index if not exists idx_admin_audit_log_admin_user on public.admin_audit_log (admin_user_id, created_at desc);
create index if not exists idx_admin_audit_log_resource on public.admin_audit_log (resource_type, resource_id);
create index if not exists idx_profiles_admin on public.profiles (is_admin) where is_admin = true;
create index if not exists idx_admin_sessions_admin_user on public.admin_sessions (admin_user_id, is_active) where is_active = true;
create index if not exists idx_admin_sessions_token on public.admin_sessions (session_token) where is_active = true;
create index if not exists idx_analytics_events_type_timestamp on public.analytics_events (event_type, timestamp desc);
create index if not exists idx_analytics_events_user on public.analytics_events (user_id, timestamp desc);
create index if not exists idx_content_versions_content on public.content_versions (content_type, content_id, version_number desc);
create index if not exists idx_system_metrics_type_timestamp on public.system_metrics (metric_type, metric_name, timestamp desc);
