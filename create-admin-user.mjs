async function createUser() {
  const response = await fetch('http://localhost:3001/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'signUp',
      email: 'admin@test.com',
      password: 'password123',
    }),
  });

  const data = await response.json();
  console.log('Signup response:', data);

  if (data.data?.user?.id) {
    return data.data.user.id;
  }
  return null;
}

async function setAdmin(userId) {
  // Use direct database connection to set admin
  const { Client } = await import('pg');

  const client = new Client({
    host: '127.0.0.1',
    port: 55433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('UPDATE profiles SET is_admin = true WHERE user_id = $1', [userId]);
    console.log(`Set user ${userId} as admin`);

    const result = await client.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    console.log('Updated profile:', result.rows[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('Creating test user...');
  const userId = await createUser();

  if (userId) {
    console.log('Setting user as admin...');
    await setAdmin(userId);
    console.log('Admin setup complete!');
  } else {
    console.log('Failed to create user');
  }
}

main();