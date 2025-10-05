-- Check admin user in local Supabase
SELECT
  p.id,
  p.email,
  p.is_admin,
  p.user_id,
  p.created_at
FROM profiles p
WHERE p.email = 'admin@test.com';
