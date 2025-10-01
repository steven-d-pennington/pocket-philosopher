-- Create profiles for any existing users that don't have one
insert into public.profiles (user_id, preferred_virtue, preferred_persona, experience_level, timezone, notifications_enabled, privacy_level, onboarding_complete)
select
  u.id,
  'wisdom', -- default virtue
  'marcus', -- default persona
  'beginner', -- default experience level
  'UTC', -- default timezone
  true, -- notifications enabled by default
  'private', -- default privacy level
  false -- onboarding not complete
from auth.users u
left join public.profiles p on u.id = p.user_id
where p.user_id is null;