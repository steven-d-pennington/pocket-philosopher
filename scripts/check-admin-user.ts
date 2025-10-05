import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUser() {
  const email = 'admin@test.com';

  console.log(`\nChecking admin status for: ${email}\n`);

  // Get user from auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log('❌ User not found in auth.users');
    return;
  }

  console.log('✅ User found in auth.users');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.log('❌ Profile not found:', profileError.message);
    return;
  }

  console.log('\n✅ Profile found:');
  console.log(`   is_admin: ${profile.is_admin}`);
  console.log(`   user_id: ${profile.user_id}`);
  console.log(`   email: ${profile.email}`);

  if (!profile.is_admin) {
    console.log('\n⚠️  ISSUE FOUND: is_admin is false or null');
    console.log('\nTo fix, run:');
    console.log(`UPDATE profiles SET is_admin = true WHERE id = '${user.id}';`);
  } else {
    console.log('\n✅ User has admin privileges!');
  }
}

checkAdminUser();
