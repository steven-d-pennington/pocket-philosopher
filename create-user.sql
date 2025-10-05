INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'dd9fc783-61c7-4961-9c70-3e11abef9407',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (user_id, preferred_virtue, preferred_persona, experience_level, onboarding_complete, is_admin, created_at)
VALUES (
  'dd9fc783-61c7-4961-9c70-3e11abef9407',
  'Stoicism',
  'marcus',
  'intermediate',
  true,
  true,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;