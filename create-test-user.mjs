import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'password123',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return;
    }

    console.log('Created user:', authData.user.id);

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        preferred_virtue: 'Stoicism',
        preferred_persona: 'marcus',
        experience_level: 'intermediate',
        onboarding_complete: true,
        is_admin: true,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('Created profile for user');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser();