-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, preferred_virtue, preferred_persona, experience_level, timezone, notifications_enabled, privacy_level, onboarding_complete)
  values (
    new.id,
    'wisdom', -- default virtue
    'marcus', -- default persona
    'beginner', -- default experience level
    'UTC', -- default timezone
    true, -- notifications enabled by default
    'private', -- default privacy level
    false -- onboarding not complete
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create a profile when a user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();