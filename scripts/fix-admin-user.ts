import { Client } from 'pg';

const client = new Client({
  host: '127.0.0.1',
  port: 55433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function fixAdminUser() {
  try {
    await client.connect();
    console.log('✅ Connected to local Supabase PostgreSQL\n');

    // First, get user from auth.users
    const authResult = await client.query(
      `SELECT id, email FROM auth.users WHERE email = $1`,
      ['admin@test.com']
    );

    if (authResult.rows.length === 0) {
      console.log('❌ User admin@test.com not found in auth.users');
      console.log('\nThe user does not exist yet. Create it by:');
      console.log('1. Go to http://localhost:3001/signup');
      console.log('2. Sign up with admin@test.com / password123');
      console.log('3. Then run this script again');
      await client.end();
      return;
    }

    const authUser = authResult.rows[0];
    console.log('Found user in auth.users:');
    console.log(`  Email: ${authUser.email}`);
    console.log(`  ID: ${authUser.id}\n`);

    // Check profile
    const checkResult = await client.query(
      `SELECT user_id, is_admin FROM profiles WHERE user_id = $1`,
      [authUser.id]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Profile not found for this user');
      console.log('This might be a database issue. The profile should have been created automatically.');
      await client.end();
      return;
    }

    const profile = checkResult.rows[0];
    console.log('Found profile:');
    console.log(`  user_id: ${profile.user_id}`);
    console.log(`  is_admin: ${profile.is_admin}\n`);

    if (profile.is_admin) {
      console.log('✅ User already has admin privileges!');
    } else {
      console.log('⚠️  Setting is_admin = true...');

      await client.query(
        `UPDATE profiles SET is_admin = true WHERE user_id = $1`,
        [authUser.id]
      );

      console.log('✅ Successfully set is_admin = true');
      console.log('\nYou should now be able to access /admin');
      console.log('Try refreshing your browser or logging out and back in.');
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminUser();
