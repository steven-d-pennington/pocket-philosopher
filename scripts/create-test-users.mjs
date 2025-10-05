import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:55432';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user data with philosophical display names
const testUsers = [
  { email: 'test1@example.com', displayName: 'StoicSeeker', virtue: 'wisdom' },
  { email: 'test2@example.com', displayName: 'TaoistWanderer', virtue: 'temperance' },
  { email: 'test3@example.com', displayName: 'EpicureanDreamer', virtue: 'wisdom' },
  { email: 'test4@example.com', displayName: 'CynicalPhilosopher', virtue: 'justice' },
  { email: 'test5@example.com', displayName: 'AureliusFollower', virtue: 'wisdom' },
  { email: 'test6@example.com', displayName: 'ZenMaster', virtue: 'temperance' },
  { email: 'test7@example.com', displayName: 'DialogueLover', virtue: 'wisdom' },
  { email: 'test8@example.com', displayName: 'VirtuePractitioner', virtue: 'courage' },
  { email: 'test9@example.com', displayName: 'MindfulThinker', virtue: 'temperance' },
  { email: 'test10@example.com', displayName: 'ReflectiveScribe', virtue: 'wisdom' },
  { email: 'test11@example.com', displayName: 'CourageousHeart', virtue: 'courage' },
  { email: 'test12@example.com', displayName: 'WisdomSeeker99', virtue: 'wisdom' },
  { email: 'test13@example.com', displayName: 'BalancedMind', virtue: 'temperance' },
  { email: 'test14@example.com', displayName: 'JustAction', virtue: 'justice' },
  { email: 'test15@example.com', displayName: 'DailyPractice', virtue: 'temperance' },
  { email: 'test16@example.com', displayName: 'InnerPeace', virtue: 'temperance' },
  { email: 'test17@example.com', displayName: 'PlatonicIdeal', virtue: 'wisdom' },
  { email: 'test18@example.com', displayName: 'SenecaStudent', virtue: 'wisdom' },
  { email: 'test19@example.com', displayName: 'EthicalWarrior', virtue: 'courage' },
  { email: 'test20@example.com', displayName: 'ContemplativeOne', virtue: 'wisdom' },
];

const password = 'test123';

async function createTestUser(userData, index) {
  try {
    console.log(`[${index + 1}/20] Creating user: ${userData.email}...`);

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
    });

    if (signUpError) {
      console.error(`  ❌ Signup error for ${userData.email}:`, signUpError.message);
      return { success: false, email: userData.email, error: signUpError.message };
    }

    if (!signUpData.user) {
      console.error(`  ❌ No user data returned for ${userData.email}`);
      return { success: false, email: userData.email, error: 'No user data' };
    }

    console.log(`  ✓ User created with ID: ${signUpData.user.id}`);

    // Wait for profile trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update profile with preferred_virtue and ensure not admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        preferred_virtue: userData.virtue,
        is_admin: false,
      })
      .eq('user_id', signUpData.user.id);

    if (updateError) {
      console.error(`  ❌ Profile update error for ${userData.email}:`, updateError.message);
      return { success: false, email: userData.email, error: updateError.message };
    }

    console.log(`  ✓ Profile updated: virtue=${userData.virtue}`);

    // Enable community features and set display name (50% of users)
    const enableCommunity = index % 2 === 0; // Every other user has community enabled
    
    if (enableCommunity) {
      const { error: communityError } = await supabase
        .from('profiles')
        .update({
          display_name: userData.displayName,
          community_enabled: true,
          community_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', signUpData.user.id);

      if (communityError) {
        console.error(`  ⚠️ Community enable error for ${userData.email}:`, communityError.message);
      } else {
        console.log(`  ✓ Community enabled: ${userData.displayName}`);
      }
    }

    console.log(`  ✅ Success: ${userData.email}\n`);
    return { success: true, email: userData.email, userId: signUpData.user.id };

  } catch (error) {
    console.error(`  ❌ Unexpected error for ${userData.email}:`, error.message);
    return { success: false, email: userData.email, error: error.message };
  }
}

async function createAllTestUsers() {
  console.log('🚀 Starting test user creation...\n');
  console.log(`Creating 20 test users with password: ${password}\n`);
  console.log('=' .repeat(60) + '\n');

  const results = [];

  for (let i = 0; i < testUsers.length; i++) {
    const result = await createTestUser(testUsers[i], i);
    results.push(result);
    
    // Small delay between users to avoid rate limiting
    if (i < testUsers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${testUsers.length}`);
  console.log(`❌ Failed: ${failed.length}/${testUsers.length}`);

  if (failed.length > 0) {
    console.log('\n Failed users:');
    failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
  }

  console.log('\n📝 Test Credentials:');
  console.log(`   Password (all users): ${password}`);
  console.log('\n✨ Community-enabled users (10):');
  successful
    .filter((_, i) => i % 2 === 0)
    .slice(0, 10)
    .forEach((r, i) => {
      const user = testUsers.find(u => u.email === r.email);
      if (user) {
        console.log(`   ${i + 1}. ${user.displayName} (${r.email})`);
      }
    });

  console.log('\n🔒 Community-disabled users (10):');
  successful
    .filter((_, i) => i % 2 !== 0)
    .slice(0, 10)
    .forEach((r, i) => {
      const user = testUsers.find(u => u.email === r.email);
      if (user) {
        console.log(`   ${i + 1}. ${user.displayName} (${r.email})`);
      }
    });

  console.log('\n✅ Done!\n');
}

createAllTestUsers();
