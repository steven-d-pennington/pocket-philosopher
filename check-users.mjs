import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsers() {
  console.log('Checking users...');

  // Check auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    console.log('Auth users:', authUsers.users.length);
    authUsers.users.forEach(user => {
      console.log(`- ${user.id}: ${user.email}`);
    });
  }

  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, email, full_name, is_admin');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log('Profiles:', profiles.length);
    profiles.forEach(profile => {
      console.log(`- ${profile.user_id}: ${profile.email} (admin: ${profile.is_admin})`);
    });
  }
}

checkUsers();