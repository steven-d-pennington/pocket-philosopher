import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  console.log('Checking profiles...');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin, created_at');

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles found:', profiles.length);
    profiles.forEach(profile => {
      console.log(`- ID: ${profile.id}, Email: ${profile.email}, Admin: ${profile.is_admin}`);
    });
  }
}

checkProfiles();