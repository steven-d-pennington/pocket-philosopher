-- Update the calculate_daily_progress function to properly calculate streaks and virtue scores
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