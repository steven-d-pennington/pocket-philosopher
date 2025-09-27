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

insert into public.philosophy_chunks (id, work, author, tradition, section, virtue, persona_tags, content, embedding, metadata)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Meditations',
    'Marcus Aurelius',
    'Stoic',
    'Book II, 5',
    'wisdom',
    '{marcus}',
    'When you wake each morning remind yourself you will meet interference, ingratitude, and selfishness; meet them with understanding that they arise from ignorance of the good.',
    null,
    jsonb_build_object('language', 'en', 'source', 'Public Domain')
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Zhuangzi',
    'Zhuang Zhou',
    'Taoist',
    'The Butterfly Dream',
    'equanimity',
    '{zhuangzi}',
    'Once Zhuang Zhou dreamt he was a butterfly... upon waking he wondered if he was Zhou dreaming of the butterfly or the butterfly dreaming of Zhou.',
    null,
    jsonb_build_object('language', 'en', 'source', 'Brook Ziporyn translation excerpt')
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Being and Nothingness',
    'Jean-Paul Sartre',
    'Existentialist',
    'Part 4, Chapter 1',
    'authenticity',
    '{sartre}',
    'Freedom is what you do with what has been done to you; every situation presents a chance to author your response.',
    null,
    jsonb_build_object('language', 'en', 'source', 'Philosophical paraphrase for educational use')
  )
on conflict (id)
do update
set work = excluded.work,
    author = excluded.author,
    tradition = excluded.tradition,
    section = excluded.section,
    virtue = excluded.virtue,
    persona_tags = excluded.persona_tags,
    content = excluded.content,
    embedding = excluded.embedding,
    metadata = excluded.metadata;

commit;
