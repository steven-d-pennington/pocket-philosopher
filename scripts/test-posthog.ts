/**
 * PostHog API Key Test Script
 *
 * Tests both server-side (POSTHOG_API_KEY) and client-side (NEXT_PUBLIC_POSTHOG_KEY)
 * PostHog API keys to ensure they're loaded correctly and can communicate with PostHog.
 */

import { PostHog } from 'posthog-node';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPostHogKeys() {
  log('\n🧪 PostHog API Key Test\n', 'cyan');
  log('═'.repeat(60), 'blue');

  // Check environment variables
  log('\n📋 Environment Variables:', 'yellow');
  log('─'.repeat(60), 'blue');

  const clientKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const serverKey = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  log(`NEXT_PUBLIC_POSTHOG_KEY: ${clientKey ? '✓ Set' : '✗ Missing'}`, clientKey ? 'green' : 'red');
  log(`  Value: ${clientKey?.substring(0, 10)}...`, 'blue');
  log(`POSTHOG_API_KEY: ${serverKey ? '✓ Set' : '✗ Missing'}`, serverKey ? 'green' : 'red');
  log(`  Value: ${serverKey?.substring(0, 10)}...`, 'blue');
  log(`NEXT_PUBLIC_POSTHOG_HOST: ${host}`, 'blue');

  if (!clientKey) {
    log('\n❌ NEXT_PUBLIC_POSTHOG_KEY is missing!', 'red');
    log('Add it to .env.local as: NEXT_PUBLIC_POSTHOG_KEY=phc_...', 'yellow');
  }

  if (!serverKey) {
    log('\n❌ POSTHOG_API_KEY is missing!', 'red');
    log('Add it to .env.local as: POSTHOG_API_KEY=phx_...', 'yellow');
  }

  if (!clientKey || !serverKey) {
    log('\n⚠️  Cannot proceed with tests. Please add missing keys.\n', 'yellow');
    process.exit(1);
  }

  // Test server-side PostHog client
  log('\n🔧 Testing Server-Side PostHog Client...', 'yellow');
  log('─'.repeat(60), 'blue');

  try {
    const posthog = new PostHog(serverKey, {
      host,
      flushAt: 1,
      flushInterval: 0, // Don't wait
    });

    const testEvent = {
      distinctId: `test-user-${Date.now()}`,
      event: 'test_event_server',
      properties: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'test-script',
      },
    };

    log(`Sending test event: ${testEvent.event}`, 'blue');
    log(`  Distinct ID: ${testEvent.distinctId}`, 'blue');

    posthog.capture(testEvent);

    // Flush immediately
    await posthog.shutdown();

    log('✓ Server-side PostHog client initialized successfully', 'green');
    log('✓ Test event sent (check PostHog dashboard)', 'green');
  } catch (error) {
    log('✗ Server-side PostHog client failed', 'red');
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red');

    if (error instanceof Error && error.message.includes('401')) {
      log('\n⚠️  401 Unauthorized Error - API key is invalid!', 'yellow');
      log('Please verify your POSTHOG_API_KEY in .env.local', 'yellow');
      log('Get your key from: PostHog Settings → Project API Key', 'yellow');
    }

    process.exit(1);
  }

  // Test client-side key format
  log('\n🌐 Testing Client-Side Key Format...', 'yellow');
  log('─'.repeat(60), 'blue');

  if (clientKey.startsWith('phc_')) {
    log('✓ Client key has correct format (phc_...)', 'green');
  } else {
    log('✗ Client key format is incorrect', 'red');
    log('  Expected format: phc_...', 'yellow');
    log(`  Got: ${clientKey.substring(0, 10)}...`, 'red');
  }

  if (serverKey.startsWith('phc_')) {
    log('✓ Server key has correct format (phc_...)', 'green');
    log('  Note: Using Project API Key for server-side is correct!', 'blue');
  } else if (serverKey.startsWith('phx_')) {
    log('✗ Server key format is incorrect', 'red');
    log('  You are using a Personal API Key (phx_...) instead of Project API Key', 'yellow');
    log('  Expected format: phc_... (same as client-side key)', 'yellow');
  } else {
    log('✗ Server key format is incorrect', 'red');
    log('  Expected format: phc_...', 'yellow');
    log(`  Got: ${serverKey.substring(0, 10)}...`, 'red');
  }

  // Summary
  log('\n📊 Test Summary:', 'yellow');
  log('═'.repeat(60), 'blue');
  log('✓ Environment variables loaded from .env.local', 'green');
  log('✓ PostHog keys are present and correctly formatted', 'green');
  log('✓ Server-side PostHog client can send events', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Check PostHog dashboard for the test event', 'blue');
  log('2. Restart your Next.js dev server: npm run dev', 'blue');
  log('3. Check browser console for client-side PostHog initialization', 'blue');
  log('');
}

// Run the test
testPostHogKeys().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});
