import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '127.0.0.1',
  port: 55433,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function setupAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check table structure
    const tableResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.log('Profiles table columns:', tableResult.rows);

    // Check existing profiles
    const profilesResult = await client.query('SELECT * FROM profiles LIMIT 5');
    console.log('Existing profiles:', profilesResult.rows);

    if (profilesResult.rows.length === 0) {
      console.log('No profiles found. You need to sign up first through the app.');
      return;
    }

    // Set the first user as admin
    const firstUser = profilesResult.rows[0];
    const userId = firstUser.id || firstUser.user_id;
    await client.query('UPDATE profiles SET is_admin = true WHERE id = $1', [userId]);
    console.log(`Set user as admin`);

    // Verify
    const updatedResult = await client.query('SELECT * FROM profiles WHERE id = $1', [userId]);
    console.log('Updated profile:', updatedResult.rows[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setupAdmin();