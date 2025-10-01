begin;

insert into public.app_settings (key, value, description, is_public)
values
  (
    'persona_catalog',
    jsonb_build_object(
      'defaultPersona', 'marcus',
      'personas', jsonb_build_array(
        jsonb_build_object(
          'id', 'marcus',
          'name', 'Marcus Aurelius',
          'model', 'openai:gpt-4o-mini',
          'virtues', jsonb_build_array('wisdom', 'temperance'),
          'style', 'Stoic, direct, compassionate pragmatism'
        ),
        jsonb_build_object(
          'id', 'zhuangzi',
          'name', 'Zhuang Zhou',
          'model', 'anthropic:claude-3-haiku',
          'virtues', jsonb_build_array('equanimity', 'freedom'),
          'style', 'Taoist parables with playful curiosity'
        ),
        jsonb_build_object(
          'id', 'sartre',
          'name', 'Jean-Paul Sartre',
          'model', 'together:meta-llama-3-70b',
          'virtues', jsonb_build_array('authenticity', 'responsibility'),
          'style', 'Existentialist reflection with actionable grounding'
        )
      )
    ),
    'Roster of AI mentors available across environments.',
    true
  ),
  (
    'practice_templates',
    jsonb_build_object(
      'profilesEnabled', true,
      'templates', jsonb_build_array(
        jsonb_build_object(
          'slug', 'morning-reflection',
          'title', 'Morning Reflection',
          'virtue', 'wisdom',
          'frequency', 'daily',
          'reminderTime', '07:00',
          'description', 'Begin the day by setting an intention and revisiting yesterday''s lessons.'
        ),
        jsonb_build_object(
          'slug', 'evening-ledger',
          'title', 'Evening Ledger',
          'virtue', 'justice',
          'frequency', 'daily',
          'reminderTime', '21:00',
          'description', 'Close out the day by acknowledging wins, challenges, and lessons.'
        ),
        jsonb_build_object(
          'slug', 'breathing-break',
          'title', 'Stoic Breathing Break',
          'virtue', 'temperance',
          'frequency', 'weekday',
          'reminderTime', '15:00',
          'description', 'Pause for four deep breaths to reset your attention and emotional state.'
        )
      )
    ),
    'Starter practice templates surfaced during onboarding.',
    true
  ),
  (
    'reflection_prompts',
    jsonb_build_object(
      'morning', jsonb_build_array(
        'What virtue will I emphasize today and why?',
        'What challenge can I transform into an opportunity?'
      ),
      'evening', jsonb_build_array(
        'Where did I live in alignment with my chosen virtue today?',
        'What lesson am I carrying forward to tomorrow?'
      ),
      'midday', jsonb_build_array(
        'What deserves my full attention right now?',
        'What perspective would my mentor offer at this moment?'
      )
    ),
    'Default reflection prompts grouped by check-in type.',
    true
  )
on conflict (key)
do update
set value = excluded.value,
    description = excluded.description,
    is_public = excluded.is_public,
    updated_at = now();

-- Seed product catalog for freemium monetization
insert into public.products (id, name, description, price_cents, product_type, persona_id, is_active, sort_order)
values
  ('coach-lao', 'Laozi - Taoist Navigator', 'Unlock the wisdom of the Tao Te Ching with Laozi as your philosophical guide. Learn to flow with change and embrace the natural order.', 399, 'coach', 'lao', true, 1),
  ('coach-simone', 'Simone de Beauvoir - Existential Companion', 'Explore existential freedom and responsibility with Simone de Beauvoir. Craft meaning through deliberate choice and authentic living.', 399, 'coach', 'simone', true, 2),
  ('coach-epictetus', 'Epictetus - Discipline Coach', 'Master the art of focusing on what you can control with Epictetus. Build resilience and mental discipline through Stoic practice.', 399, 'coach', 'epictetus', true, 3),
  ('coach-aristotle', 'Aristotle - Virtue Guide', 'Cultivate eudaimonia through the golden mean with Aristotle. Balance virtue and practical wisdom in your daily life.', 399, 'coach', 'aristotle', true, 4),
  ('coach-plato', 'Plato - Truth Seeker', 'Discover eternal truths and ideal forms with Plato. Question reality and live in alignment with higher ideals.', 399, 'coach', 'plato', true, 5);

commit;
