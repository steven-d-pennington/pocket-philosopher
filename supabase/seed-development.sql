-- Development seed data for testing
-- This script creates rich test data for 3 users with comprehensive datasets

-- First, let's create some test profiles (assuming we have some existing auth users)
-- Note: In a real scenario, these would be created through the signup process

-- Insert test profiles (using mock user IDs for development)
INSERT INTO public.profiles (user_id, preferred_virtue, preferred_persona, experience_level, daily_practice_time, timezone, notifications_enabled, privacy_level, onboarding_complete, is_admin, created_at, updated_at)
VALUES
  ('dev-user-alex-001', 'wisdom', 'marcus', 'intermediate', '07:30:00', 'America/New_York', true, 'public', true, false, NOW(), NOW()),
  ('dev-user-sara-002', 'courage', 'zhuangzi', 'advanced', '06:00:00', 'America/Los_Angeles', true, 'private', true, false, NOW(), NOW()),
  ('dev-user-mike-003', 'temperance', 'sartre', 'beginner', '08:00:00', 'Europe/London', false, 'friends_only', false, true, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Create habits for Alex (wisdom focus)
INSERT INTO public.habits (user_id, name, description, virtue, tracking_type, target_value, difficulty_level, frequency, active_days, reminder_time, is_active, sort_order, created_at, updated_at)
VALUES
  ('dev-user-alex-001', 'Morning Meditation', '10 minutes of focused breathing and mindfulness', 'wisdom', 'boolean', null, 'easy', 'daily', '{1,2,3,4,5,6,7}', '07:00:00', true, 1, NOW(), NOW()),
  ('dev-user-alex-001', 'Reading Philosophy', 'Read philosophical texts for personal growth', 'wisdom', 'numeric', 30, 'medium', 'daily', '{1,2,3,4,5,6,7}', '19:00:00', true, 2, NOW(), NOW()),
  ('dev-user-alex-001', 'Gratitude Journal', 'Write down 3 things I''m grateful for', 'temperance', 'boolean', null, 'easy', 'daily', '{1,2,3,4,5,6,7}', '21:00:00', true, 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create habits for Sara (courage focus)
INSERT INTO public.habits (user_id, name, description, virtue, tracking_type, target_value, difficulty_level, frequency, active_days, reminder_time, is_active, sort_order, created_at, updated_at)
VALUES
  ('dev-user-sara-002', 'Exercise Routine', '45-minute workout session', 'courage', 'boolean', null, 'hard', 'daily', '{1,3,5}', '06:30:00', true, 1, NOW(), NOW()),
  ('dev-user-sara-002', 'Mindful Eating', 'Eat meals without distractions', 'temperance', 'boolean', null, 'medium', 'daily', '{1,2,3,4,5,6,7}', null, true, 2, NOW(), NOW()),
  ('dev-user-sara-002', 'Creative Writing', 'Write 500 words of creative content', 'wisdom', 'numeric', 500, 'medium', 'weekly', '{7}', '10:00:00', true, 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create habits for Mike (temperance focus)
INSERT INTO public.habits (user_id, name, description, virtue, tracking_type, target_value, difficulty_level, frequency, active_days, reminder_time, is_active, sort_order, created_at, updated_at)
VALUES
  ('dev-user-mike-003', 'Learn New Skill', 'Spend 30 minutes learning something new', 'wisdom', 'boolean', null, 'medium', 'daily', '{1,2,3,4,5}', '20:00:00', true, 1, NOW(), NOW()),
  ('dev-user-mike-003', 'Digital Detox', 'No screens for 2 hours before bed', 'temperance', 'boolean', null, 'hard', 'daily', '{1,2,3,4,5,6,7}', '21:00:00', true, 2, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create habit logs (sample data for the last 7 days)
-- Alex's habit logs
INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_before, mood_after, created_at, updated_at)
SELECT
  'dev-user-alex-001',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * n,
  CASE WHEN h.tracking_type = 'boolean' THEN 1 ELSE h.target_value END,
  CASE
    WHEN h.name = 'Morning Meditation' THEN 'Felt more centered and focused throughout the day'
    WHEN h.name = 'Reading Philosophy' THEN 'Read about Stoic principles of virtue'
    WHEN h.name = 'Gratitude Journal' THEN 'Grateful for health, family, and meaningful work'
    ELSE 'Completed successfully'
  END,
  'neutral',
  'positive',
  NOW(),
  NOW()
FROM public.habits h
CROSS JOIN generate_series(0, 6) n
WHERE h.user_id = 'dev-user-alex-001' AND h.is_active = true
ON CONFLICT DO NOTHING;

-- Sara's habit logs
INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_before, mood_after, created_at, updated_at)
SELECT
  'dev-user-sara-002',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * n,
  CASE WHEN h.tracking_type = 'boolean' THEN 1 ELSE h.target_value END,
  CASE
    WHEN h.name = 'Exercise Routine' THEN 'Great workout - feeling energized!'
    WHEN h.name = 'Mindful Eating' THEN 'Enjoyed lunch without phone distractions'
    WHEN h.name = 'Creative Writing' THEN 'Wrote 520 words of short story'
    ELSE 'Completed successfully'
  END,
  'neutral',
  'positive',
  NOW(),
  NOW()
FROM public.habits h
CROSS JOIN generate_series(0, 6) n
WHERE h.user_id = 'dev-user-sara-002' AND h.is_active = true
ON CONFLICT DO NOTHING;

-- Mike's habit logs (less consistent to show realistic data)
INSERT INTO public.habit_logs (user_id, habit_id, date, value, notes, mood_before, mood_after, created_at, updated_at)
SELECT
  'dev-user-mike-003',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * n,
  CASE WHEN h.tracking_type = 'boolean' THEN 1 ELSE h.target_value END,
  CASE
    WHEN h.name = 'Learn New Skill' THEN 'Learned about React hooks'
    WHEN h.name = 'Digital Detox' THEN 'Read a book instead of scrolling'
    ELSE 'Completed successfully'
  END,
  'neutral',
  'positive',
  NOW(),
  NOW()
FROM public.habits h
CROSS JOIN generate_series(0, 4) n  -- Only 5 days of data for Mike
WHERE h.user_id = 'dev-user-mike-003' AND h.is_active = true
ON CONFLICT DO NOTHING;

-- Create reflections
INSERT INTO public.reflections (user_id, date, virtue, content, mood_before, mood_after, practice_type, created_at, updated_at)
VALUES
  ('dev-user-alex-001', CURRENT_DATE - INTERVAL '1 day', 'wisdom', 'Today I practiced patience during a difficult work meeting. Instead of reacting impulsively, I took a moment to breathe and respond thoughtfully. This helped de-escalate the situation and led to a more productive conversation.', 'frustrated', 'calm', 'reflection', NOW(), NOW()),
  ('dev-user-alex-001', CURRENT_DATE - INTERVAL '2 days', 'temperance', 'I noticed myself getting caught up in social media scrolling. I put down my phone and spent 20 minutes meditating instead. The clarity I gained was worth it.', 'restless', 'peaceful', 'reflection', NOW(), NOW()),
  ('dev-user-sara-002', CURRENT_DATE - INTERVAL '1 day', 'courage', 'I had a difficult conversation with my manager about my career goals. It was uncomfortable but necessary. I''m proud of myself for speaking up.', 'anxious', 'empowered', 'reflection', NOW(), NOW()),
  ('dev-user-sara-002', CURRENT_DATE - INTERVAL '3 days', 'temperance', 'Practiced mindful eating during lunch. Instead of rushing through my meal while working, I took time to appreciate the food and the company. It made the experience much more enjoyable.', 'distracted', 'present', 'reflection', NOW(), NOW()),
  ('dev-user-mike-003', CURRENT_DATE - INTERVAL '1 day', 'wisdom', 'Started learning about Stoic philosophy. The concept of focusing on what I can control versus what I can''t control is really resonating with me.', 'confused', 'curious', 'reflection', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create daily progress entries
INSERT INTO public.daily_progress (user_id, date, virtue_focus, practice_completed, reflection_written, habits_completed, overall_score, notes, created_at, updated_at)
VALUES
  ('dev-user-alex-001', CURRENT_DATE - INTERVAL '1 day', 'wisdom', true, true, 3, 8.5, 'Great day of focused practice', NOW(), NOW()),
  ('dev-user-alex-001', CURRENT_DATE - INTERVAL '2 days', 'temperance', true, true, 2, 7.0, 'Good progress on self-control', NOW(), NOW()),
  ('dev-user-sara-002', CURRENT_DATE - INTERVAL '1 day', 'courage', true, true, 2, 9.0, 'Excellent day of courageous action', NOW(), NOW()),
  ('dev-user-sara-002', CURRENT_DATE - INTERVAL '2 days', 'temperance', true, false, 3, 7.5, 'Strong habit completion', NOW(), NOW()),
  ('dev-user-mike-003', CURRENT_DATE - INTERVAL '1 day', 'wisdom', true, true, 1, 6.0, 'Starting to build momentum', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create purchases
INSERT INTO public.purchases (user_id, product_id, amount, currency, status, purchase_date, metadata, created_at, updated_at)
VALUES
  ('dev-user-alex-001', 'premium_subscription', 29.99, 'USD', 'completed', CURRENT_DATE - INTERVAL '5 days', '{"plan": "monthly", "features": ["unlimited_reflections", "advanced_analytics"]}', NOW(), NOW()),
  ('dev-user-sara-002', 'persona_unlock', 9.99, 'USD', 'completed', CURRENT_DATE - INTERVAL '10 days', '{"persona": "zhuangzi", "type": "unlock"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create some Marcus conversations (AI mentor chats)
INSERT INTO public.marcus_conversations (user_id, title, created_at, updated_at)
VALUES
  ('dev-user-alex-001', 'Wisdom in Decision Making', NOW(), NOW()),
  ('dev-user-sara-002', 'Finding Courage in Uncertainty', NOW(), NOW()),
  ('dev-user-mike-003', 'The Art of Self-Control', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get conversation IDs for message insertion
INSERT INTO public.marcus_messages (conversation_id, role, content, created_at)
SELECT
  mc.id,
  'user',
  CASE
    WHEN mc.title = 'Wisdom in Decision Making' THEN 'How can I make better decisions under pressure?'
    WHEN mc.title = 'Finding Courage in Uncertainty' THEN 'I''m afraid of making the wrong career choice. How can I find courage?'
    WHEN mc.title = 'The Art of Self-Control' THEN 'How do I stop procrastinating on important tasks?'
  END,
  NOW()
FROM public.marcus_conversations mc
WHERE mc.title IN ('Wisdom in Decision Making', 'Finding Courage in Uncertainty', 'The Art of Self-Control')
ON CONFLICT DO NOTHING;

INSERT INTO public.marcus_messages (conversation_id, role, content, created_at)
SELECT
  mc.id,
  'assistant',
  CASE
    WHEN mc.title = 'Wisdom in Decision Making' THEN 'Remember, Marcus Aurelius taught us to focus on what we can control. In moments of pressure, pause and ask: Is this within my power? If yes, act with virtue. If not, accept it with equanimity.'
    WHEN mc.title = 'Finding Courage in Uncertainty' THEN 'Courage is not the absence of fear, but action in spite of it. Consider the worst-case scenario - can you handle it? Usually, the answer is yes. Then focus on the potential for growth and learning.'
    WHEN mc.title = 'The Art of Self-Control' THEN 'Begin with small acts of discipline. Break large tasks into tiny, achievable steps. Remember that each time you choose the harder right over the easier wrong, you strengthen your character.'
  END,
  NOW() + INTERVAL '1 minute'
FROM public.marcus_conversations mc
WHERE mc.title IN ('Wisdom in Decision Making', 'Finding Courage in Uncertainty', 'The Art of Self-Control')
ON CONFLICT DO NOTHING;

-- Create some feedback entries
INSERT INTO public.feedback (user_id, type, content, rating, metadata, created_at)
VALUES
  ('dev-user-alex-001', 'feature_request', 'Love the Marcus conversations! Could we have more historical context in responses?', 5, '{"feature": "marcus_conversations"}', NOW()),
  ('dev-user-sara-002', 'bug_report', 'The habit tracking sometimes doesn''t save on mobile', 3, '{"platform": "mobile", "feature": "habit_tracking"}', NOW()),
  ('dev-user-mike-003', 'general', 'This app is really helping me build better habits. Thank you!', 5, '{}', NOW())
ON CONFLICT DO NOTHING;

-- Create some analytics events
INSERT INTO public.analytics_events (user_id, event_type, event_data, created_at)
VALUES
  ('dev-user-alex-001', 'reflection_created', '{"virtue": "wisdom", "word_count": 150}', NOW()),
  ('dev-user-alex-001', 'habit_completed', '{"habit_name": "Morning Meditation", "streak": 7}', NOW()),
  ('dev-user-sara-002', 'purchase_completed', '{"product": "persona_unlock", "amount": 9.99}', NOW()),
  ('dev-user-mike-003', 'marcus_conversation', '{"message_count": 4, "duration_minutes": 12}', NOW())
ON CONFLICT DO NOTHING;

-- Update last_active_at for profiles
UPDATE public.profiles
SET last_active_at = NOW()
WHERE user_id IN ('dev-user-alex-001', 'dev-user-sara-002', 'dev-user-mike-003');

COMMIT;

-- Summary of created data
SELECT
  'Development seed data created successfully!' as message,
  (SELECT COUNT(*) FROM public.profiles WHERE user_id LIKE 'dev-user-%') as profiles_created,
  (SELECT COUNT(*) FROM public.habits WHERE user_id LIKE 'dev-user-%') as habits_created,
  (SELECT COUNT(*) FROM public.habit_logs WHERE user_id LIKE 'dev-user-%') as habit_logs_created,
  (SELECT COUNT(*) FROM public.reflections WHERE user_id LIKE 'dev-user-%') as reflections_created,
  (SELECT COUNT(*) FROM public.daily_progress WHERE user_id LIKE 'dev-user-%') as progress_entries_created,
  (SELECT COUNT(*) FROM public.purchases WHERE user_id LIKE 'dev-user-%') as purchases_created,
  (SELECT COUNT(*) FROM public.marcus_conversations WHERE user_id LIKE 'dev-user-%') as conversations_created;