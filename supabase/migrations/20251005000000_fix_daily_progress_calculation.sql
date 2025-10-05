-- Fix calculate_daily_progress to match seed script logic
-- Bug: virtue scores were averaging across ALL habits (including 0 for non-matching virtues)
-- Fix: Only average habits that match each virtue, normalize to 0-100 scale

create or replace function public.calculate_daily_progress(target_user uuid, target_date date)
returns void as $$
declare
  v_habits_completed integer;
  v_total_habits integer;
  v_completion_rate numeric;
  v_wisdom_score numeric;
  v_justice_score numeric;
  v_temperance_score numeric;
  v_courage_score numeric;
  v_avg_virtue_score numeric;
  v_return_score numeric;
  v_streak_days integer;
  v_has_morning boolean;
  v_has_evening boolean;
begin
  -- Count completed habits for target date
  select count(*) into v_habits_completed
  from public.habit_logs
  where user_id = target_user and date = target_date;

  -- Count total active habits for user
  select count(*) into v_total_habits
  from public.habits
  where user_id = target_user and is_archived = false;

  -- Calculate completion rate
  v_completion_rate := case
    when v_total_habits > 0 then v_habits_completed::numeric / v_total_habits::numeric
    else 0
  end;

  -- Check for reflections
  select exists(
    select 1 from public.reflections
    where user_id = target_user and date = target_date and type = 'morning'
  ) into v_has_morning;

  select exists(
    select 1 from public.reflections
    where user_id = target_user and date = target_date and type = 'evening'
  ) into v_has_evening;

  -- Calculate virtue scores (0-100 scale, only counting habits for each virtue)
  -- Wisdom
  with wisdom_habits as (
    select count(*) as total
    from public.habits h
    where h.user_id = target_user and h.virtue = 'wisdom' and h.is_archived = false
  ),
  wisdom_completed as (
    select count(*) as completed
    from public.habit_logs hl
    join public.habits h on hl.habit_id = h.id
    where hl.user_id = target_user
      and hl.date = target_date
      and h.virtue = 'wisdom'
  )
  select case
    when wh.total > 0 then least(100, (wc.completed::numeric / wh.total::numeric) * 100)
    else 0
  end into v_wisdom_score
  from wisdom_habits wh, wisdom_completed wc;

  -- Justice
  with justice_habits as (
    select count(*) as total
    from public.habits h
    where h.user_id = target_user and h.virtue = 'justice' and h.is_archived = false
  ),
  justice_completed as (
    select count(*) as completed
    from public.habit_logs hl
    join public.habits h on hl.habit_id = h.id
    where hl.user_id = target_user
      and hl.date = target_date
      and h.virtue = 'justice'
  )
  select case
    when jh.total > 0 then least(100, (jc.completed::numeric / jh.total::numeric) * 100)
    else 0
  end into v_justice_score
  from justice_habits jh, justice_completed jc;

  -- Temperance
  with temperance_habits as (
    select count(*) as total
    from public.habits h
    where h.user_id = target_user and h.virtue = 'temperance' and h.is_archived = false
  ),
  temperance_completed as (
    select count(*) as completed
    from public.habit_logs hl
    join public.habits h on hl.habit_id = h.id
    where hl.user_id = target_user
      and hl.date = target_date
      and h.virtue = 'temperance'
  )
  select case
    when th.total > 0 then least(100, (tc.completed::numeric / th.total::numeric) * 100)
    else 0
  end into v_temperance_score
  from temperance_habits th, temperance_completed tc;

  -- Courage
  with courage_habits as (
    select count(*) as total
    from public.habits h
    where h.user_id = target_user and h.virtue = 'courage' and h.is_archived = false
  ),
  courage_completed as (
    select count(*) as completed
    from public.habit_logs hl
    join public.habits h on hl.habit_id = h.id
    where hl.user_id = target_user
      and hl.date = target_date
      and h.virtue = 'courage'
  )
  select case
    when ch.total > 0 then least(100, (cc.completed::numeric / ch.total::numeric) * 100)
    else 0
  end into v_courage_score
  from courage_habits ch, courage_completed cc;

  -- Calculate average virtue score
  v_avg_virtue_score := (v_wisdom_score + v_justice_score + v_temperance_score + v_courage_score) / 4;

  -- Calculate return score (avg virtue * completion rate)
  v_return_score := v_avg_virtue_score * v_completion_rate;

  -- Calculate streak (consecutive days with completion >= 50% OR has reflections)
  with daily_activity as (
    select
      d.date,
      coalesce(h.completed, 0) as completed,
      coalesce(h.total, 0) as total,
      coalesce(r.has_morning, false) as has_morning,
      coalesce(r.has_evening, false) as has_evening
    from (
      select distinct date
      from (
        select date from public.habit_logs where user_id = target_user
        union
        select date from public.reflections where user_id = target_user
      ) dates
      where date <= target_date
    ) d
    left join (
      select
        hl.date,
        count(*) as completed,
        (select count(*) from public.habits where user_id = target_user and is_archived = false) as total
      from public.habit_logs hl
      where hl.user_id = target_user
      group by hl.date
    ) h on d.date = h.date
    left join (
      select
        date,
        bool_or(type = 'morning') as has_morning,
        bool_or(type = 'evening') as has_evening
      from public.reflections
      where user_id = target_user
      group by date
    ) r on d.date = r.date
  ),
  streak_calc as (
    select
      date,
      case
        when total > 0 and (completed::numeric / total::numeric) >= 0.5 then true
        when has_morning or has_evening then true
        else false
      end as is_active
    from daily_activity
    order by date desc
  ),
  consecutive_days as (
    select count(*) as streak
    from (
      select
        date,
        is_active,
        row_number() over (order by date desc) as rn,
        sum(case when not is_active then 1 else 0 end) over (order by date desc rows between unbounded preceding and current row) as break_group
      from streak_calc
    ) grouped
    where break_group = 0 and is_active
  )
  select streak into v_streak_days from consecutive_days;

  -- Ensure streak is at least 1 if current day is active
  if (v_completion_rate >= 0.5 or v_has_morning or v_has_evening) and coalesce(v_streak_days, 0) = 0 then
    v_streak_days := 1;
  end if;

  -- Upsert daily_progress record
  insert into public.daily_progress (
    user_id,
    date,
    habits_completed,
    completion_rate,
    return_score,
    streak_days,
    wisdom_score,
    justice_score,
    temperance_score,
    courage_score,
    morning_reflection_complete,
    evening_reflection_complete
  ) values (
    target_user,
    target_date,
    v_habits_completed,
    round(v_completion_rate::numeric, 2),
    round(v_return_score::numeric, 2),
    coalesce(v_streak_days, 0),
    round(v_wisdom_score::numeric, 2),
    round(v_justice_score::numeric, 2),
    round(v_temperance_score::numeric, 2),
    round(v_courage_score::numeric, 2),
    v_has_morning,
    v_has_evening
  )
  on conflict (user_id, date)
  do update set
    habits_completed = excluded.habits_completed,
    completion_rate = excluded.completion_rate,
    return_score = excluded.return_score,
    streak_days = excluded.streak_days,
    wisdom_score = excluded.wisdom_score,
    justice_score = excluded.justice_score,
    temperance_score = excluded.temperance_score,
    courage_score = excluded.courage_score,
    morning_reflection_complete = excluded.morning_reflection_complete,
    evening_reflection_complete = excluded.evening_reflection_complete,
    updated_at = now();
end;
$$ language plpgsql;

comment on function public.calculate_daily_progress is 'Recalculate Return Score, streaks, and virtue metrics for a given day using corrected normalization logic.';
