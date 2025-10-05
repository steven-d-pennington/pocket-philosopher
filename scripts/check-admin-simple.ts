import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmin() {
  console.log('\nChecking profiles table for admin users...\n');

  // Query profiles where is_admin might be true
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, is_admin, user_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Recent profiles:');
  profiles?.forEach(p => {
    const adminStatus = p.is_admin ? '✅ ADMIN' : '❌ not admin';
    console.log(`${adminStatus} - ${p.email} (id: ${p.id?.substring(0, 8)}...)`);
  });

  const adminUser = profiles?.find(p => p.email === 'admin@test.com');

  if (adminUser) {
    console.log(`\nFound admin@test.com:`);
    console.log(`  ID: ${adminUser.id}`);
    console.log(`  is_admin: ${adminUser.is_admin}`);

    if (!adminUser.is_admin) {
      console.log('\n⚠️  is_admin is FALSE - this is why you\'re being redirected!');
      console.log('\nTo fix this, you need to run this SQL query:');
      console.log(`\nUPDATE profiles SET is_admin = true WHERE email = 'admin@test.com';\n`);
    }
  } else {
    console.log('\n❌ admin@test.com not found in profiles table');
  }
}

checkAdmin();
