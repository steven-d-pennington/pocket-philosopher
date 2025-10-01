-- Grant admin privileges to the existing user
UPDATE public.profiles
SET is_admin = true
WHERE user_id = 'dd9fc783-61c7-4961-9c70-3e11abef9407';