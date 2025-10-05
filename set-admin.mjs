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

async function setAdminUser() {
  const userId = 'a63fafa5-c585-44bf-a856-902be478bc55'; // From the signup response

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting admin user:', error);
  } else {
    console.log('Successfully set user as admin');
  }
}

setAdminUser();