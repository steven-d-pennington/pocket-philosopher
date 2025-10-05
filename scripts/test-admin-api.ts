import { config } from 'dotenv';

config({ path: '.env.local' });

async function testAdminAPI() {
  const baseUrl = 'http://localhost:3001';

  console.log('\n🔍 Testing Admin Users API...\n');

  try {
    const response = await fetch(`${baseUrl}/api/admin/users?page=1&limit=20`, {
      headers: {
        'Cookie': 'your-auth-cookie-here', // You'll need to get this from browser
      }
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (data.users) {
      console.log(`\n✅ Found ${data.users.length} users`);
    } else if (data.error) {
      console.log(`\n❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testAdminAPI();
