-- Seed 6 months of historical data for an existing user
-- Usage: Replace the user_id below with your actual user ID, then run:
-- docker exec supabase_db_pocket-philosopher psql -U postgres -f /path/to/this/file.sql

-- Or run directly:
-- docker exec supabase_db_pocket-philosopher psql -U postgres < supabase/seed-user-data.sql

DO $$
DECLARE
  target_user_id uuid := '9356b5be-fb2a-49e2-97bd-5625ab19dd50'; -- REPLACE WITH YOUR USER ID
  habit_meditation uuid;
  habit_reading uuid;
  habit_exercise uuid;
  habit_gratitude uuid;
  habit_journaling uuid;
  loop_date date := '2025-04-01';
  end_date date := '2025-10-03';
  morning_intentions text[] := ARRAY[
    'Practice patience in challenging situations',
    'Focus on what I can control today',
    'Show gratitude for small moments',
    'Lead with compassion and understanding',
    'Embrace discomfort as growth',
    'Find wisdom in everyday experiences',
    'Act with courage in difficult decisions',
    'Cultivate inner peace and clarity',
    'Listen more, speak less',
    'Be present in each moment'
  ];
  evening_lessons text[] := ARRAY[
    'Patience transforms frustration into understanding',
    'Control lies only within our response',
    'Gratitude shifts perspective from lack to abundance',
    'Compassion creates connection',
    'Growth happens outside comfort zones',
    'Every experience contains hidden wisdom',
    'Courage is acting despite fear',
    'Peace comes from acceptance',
    'True wisdom begins with listening',
    'Presence is the greatest gift'
  ];
  random_score numeric;
  day_index integer := 0;
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO user_exists;

  IF NOT user_exists THEN
    RAISE EXCEPTION 'User % does not exist. Please update target_user_id with your actual user ID.', target_user_id;
  END IF;

  RAISE NOTICE 'Seeding 6 months of data for user %', target_user_id;

  -- Update profile to be admin and set preferences
  UPDATE public.profiles
  SET
    preferred_virtue = 'Stoicism',
    preferred_persona = 'marcus',
    experience_level = 'intermediate',
    onboarding_complete = true,
    is_admin = true
  WHERE user_id = target_user_id;

  -- Delete existing data for this user (to avoid conflicts)
  DELETE FROM public.habit_logs WHERE user_id = target_user_id;
  DELETE FROM public.habits WHERE user_id = target_user_id;
  DELETE FROM public.reflections WHERE user_id = target_user_id;
  DELETE FROM public.daily_progress WHERE user_id = target_user_id;
  DELETE FROM public.marcus_conversations WHERE user_id = target_user_id;

  -- Create diverse habits
  INSERT INTO public.habits (id, user_id, name, description, virtue, tracking_type, frequency, is_active, created_at)
  VALUES
    (gen_random_uuid(), target_user_id, 'Morning Meditation', '10 minutes of mindfulness meditation', 'Stoicism', 'boolean', 'daily', true, '2025-04-01 08:00:00+00'),
    (gen_random_uuid(), target_user_id, 'Reading Philosophy', 'Read philosophical texts or articles', 'Stoicism', 'boolean', 'daily', true, '2025-04-01 08:00:00+00'),
    (gen_random_uuid(), target_user_id, 'Physical Exercise', '30 minutes of physical activity', 'Stoicism', 'boolean', 'daily', true, '2025-04-01 08:00:00+00'),
    (gen_random_uuid(), target_user_id, 'Gratitude Practice', 'Write down 3 things I''m grateful for', 'Stoicism', 'boolean', 'daily', true, '2025-04-01 08:00:00+00'),
    (gen_random_uuid(), target_user_id, 'Evening Journaling', 'Reflect on the day and lessons learned', 'Stoicism', 'boolean', 'daily', true, '2025-04-01 08:00:00+00');

  -- Get habit IDs
  SELECT id INTO habit_meditation FROM public.habits WHERE user_id = target_user_id AND name = 'Morning Meditation';
  SELECT id INTO habit_reading FROM public.habits WHERE user_id = target_user_id AND name = 'Reading Philosophy';
  SELECT id INTO habit_exercise FROM public.habits WHERE user_id = target_user_id AND name = 'Physical Exercise';
  SELECT id INTO habit_gratitude FROM public.habits WHERE user_id = target_user_id AND name = 'Gratitude Practice';
  SELECT id INTO habit_journaling FROM public.habits WHERE user_id = target_user_id AND name = 'Evening Journaling';

  RAISE NOTICE 'Creating historical data from % to %', loop_date, end_date;

  -- Generate 6 months of historical data
  WHILE loop_date <= end_date LOOP
    day_index := day_index + 1;

    -- Morning reflection (95% of days)
    IF random() < 0.95 THEN
      INSERT INTO public.reflections (user_id, date, type, virtue_focus, intention, mood, created_at)
      VALUES (
        target_user_id, loop_date, 'morning', 'Stoicism',
        morning_intentions[(day_index % 10) + 1],
        7 + floor(random() * 3)::integer,
        loop_date + interval '7 hours'
      );
    END IF;

    -- Evening reflection (90% of days)
    IF random() < 0.90 THEN
      INSERT INTO public.reflections (user_id, date, type, virtue_focus, lesson, gratitude, mood, journal_entry, created_at)
      VALUES (
        target_user_id, loop_date, 'evening', 'Stoicism',
        evening_lessons[(day_index % 10) + 1],
        'Grateful for progress, learning, and growth',
        7 + floor(random() * 3)::integer,
        'Today brought valuable lessons about ' || evening_lessons[(day_index % 10) + 1],
        loop_date + interval '20 hours'
      );
    END IF;

    -- Habit logs with realistic completion rates
    IF random() < 0.90 THEN
      INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_after, created_at)
      VALUES (target_user_id, habit_meditation, loop_date, 1, 'Felt centered and calm', 'peaceful', loop_date + interval '7 hours 15 minutes');
    END IF;

    IF random() < 0.85 THEN
      INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_after, created_at)
      VALUES (target_user_id, habit_reading, loop_date, 1, 'Insightful reading session', 'inspired', loop_date + interval '8 hours');
    END IF;

    IF random() < 0.80 THEN
      INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_after, created_at)
      VALUES (target_user_id, habit_exercise, loop_date, 1, 'Good workout, feeling strong', 'energized', loop_date + interval '18 hours');
    END IF;

    IF random() < 0.95 THEN
      INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_after, created_at)
      VALUES (target_user_id, habit_gratitude, loop_date, 1, 'Grateful for health, family, and opportunities', 'content', loop_date + interval '20 hours');
    END IF;

    IF random() < 0.88 THEN
      INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_after, created_at)
      VALUES (target_user_id, habit_journaling, loop_date, 1, 'Valuable reflections on today', 'reflective', loop_date + interval '21 hours');
    END IF;

    -- Calculate daily progress
    random_score := 65 + (random() * 25);

    INSERT INTO public.daily_progress (
      user_id, date, morning_intention, habits_completed, completion_rate, return_score,
      wisdom_score, justice_score, temperance_score, courage_score,
      morning_reflection_complete, evening_reflection_complete, created_at
    )
    SELECT
      target_user_id, loop_date,
      morning_intentions[(day_index % 10) + 1],
      COUNT(*),
      (COUNT(*)::numeric / 5.0) * 100,
      random_score,
      random_score + (random() * 10 - 5),
      random_score + (random() * 10 - 5),
      random_score + (random() * 10 - 5),
      random_score + (random() * 10 - 5),
      EXISTS(SELECT 1 FROM public.reflections WHERE user_id = target_user_id AND date = loop_date AND type = 'morning'),
      EXISTS(SELECT 1 FROM public.reflections WHERE user_id = target_user_id AND date = loop_date AND type = 'evening'),
      loop_date + interval '23 hours'
    FROM public.habit_logs
    WHERE user_id = target_user_id AND date = loop_date;

    loop_date := loop_date + interval '1 day';
  END LOOP;

  -- Calculate streaks
  WITH streak_calc AS (
    SELECT
      date,
      CASE
        WHEN habits_completed >= 3 THEN
          ROW_NUMBER() OVER (PARTITION BY grp ORDER BY date)
        ELSE 0
      END as streak
    FROM (
      SELECT
        date, habits_completed,
        date - (ROW_NUMBER() OVER (ORDER BY date) * interval '1 day') as grp
      FROM public.daily_progress
      WHERE user_id = target_user_id AND habits_completed >= 3
      ORDER BY date
    ) sub
  )
  UPDATE public.daily_progress dp
  SET streak_days = COALESCE(sc.streak, 0)
  FROM streak_calc sc
  WHERE dp.user_id = target_user_id AND dp.date = sc.date;

  -- Create Marcus conversations
  FOR i IN 1..10 LOOP
    INSERT INTO public.marcus_conversations (user_id, title, context_type, virtue_focus, active_persona, is_active, created_at)
    VALUES (
      target_user_id,
      CASE i % 5
        WHEN 0 THEN 'Dealing with difficult situations'
        WHEN 1 THEN 'Finding inner peace'
        WHEN 2 THEN 'Building daily discipline'
        WHEN 3 THEN 'Understanding Stoic principles'
        ELSE 'Navigating life challenges'
      END,
      'practice', 'Stoicism', 'marcus', false,
      '2025-04-01'::date + (i * 18 || ' days')::interval
    );
  END LOOP;

  RAISE NOTICE 'Successfully seeded 6 months of data for user %!', target_user_id;
END $$;
