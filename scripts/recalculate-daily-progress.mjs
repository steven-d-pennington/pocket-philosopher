import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function recalculateDailyProgress() {
  console.log('🔄 Recalculating daily progress for all users...\n');

  // Get all users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id');

  if (profilesError) {
    console.error('❌ Failed to fetch profiles:', profilesError);
    process.exit(1);
  }

  console.log(`Found ${profiles.length} users\n`);

  const today = new Date().toISOString().split('T')[0];
  let successCount = 0;
  let errorCount = 0;

  for (const profile of profiles) {
    try {
      // Call the calculate_daily_progress function for today
      const { error } = await supabase.rpc('calculate_daily_progress', {
        target_user: profile.user_id,
        target_date: today
      });

      if (error) {
        console.error(`  ❌ ${profile.user_id}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✓ ${profile.user_id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${profile.user_id}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`\n✅ Done!`);
}

recalculateDailyProgress().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
