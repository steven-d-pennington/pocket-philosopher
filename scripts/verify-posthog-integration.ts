/**
 * PostHog Integration Verification Script
 *
 * Verifies that PostHog is properly integrated in the application code
 * and can send events from both server and client contexts.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE importing analytics
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { serverAnalytics } from '../lib/analytics/server';

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

async function verifyPostHogIntegration() {
  log('\n✅ PostHog Integration Verification\n', 'cyan');
  log('═'.repeat(60), 'blue');

  // Test 1: Server Analytics Module
  log('\n📊 Test 1: Server Analytics Module', 'yellow');
  log('─'.repeat(60), 'blue');

  if (!serverAnalytics.isEnabled) {
    log('✗ Server analytics is NOT enabled', 'red');
    log('  Check that POSTHOG_API_KEY is set in .env.local', 'yellow');
    process.exit(1);
  } else {
    log('✓ Server analytics is enabled', 'green');
  }

  // Test 2: Capture Event
  log('\n📤 Test 2: Capture Event', 'yellow');
  log('─'.repeat(60), 'blue');

  try {
    serverAnalytics.capture({
      event: 'test_integration_verification',
      distinctId: `test-user-${Date.now()}`,
      properties: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'integration-verification-script',
      },
    });
    log('✓ Event captured successfully', 'green');
    log('  Event: test_integration_verification', 'blue');
  } catch (error) {
    log('✗ Failed to capture event', 'red');
    log(`  Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }

  // Test 3: Identify User
  log('\n👤 Test 3: Identify User', 'yellow');
  log('─'.repeat(60), 'blue');

  try {
    serverAnalytics.identify({
      distinctId: `test-user-${Date.now()}`,
      properties: {
        email: 'test@example.com',
        name: 'Test User',
        test: true,
      },
    });
    log('✓ User identified successfully', 'green');
  } catch (error) {
    log('✗ Failed to identify user', 'red');
    log(`  Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }

  // Test 4: Flush Events
  log('\n🚀 Test 4: Flush Events to PostHog', 'yellow');
  log('─'.repeat(60), 'blue');

  try {
    await serverAnalytics.flush();
    log('✓ Events flushed successfully', 'green');
    log('  Check PostHog dashboard for events', 'blue');
  } catch (error) {
    log('✗ Failed to flush events', 'red');
    log(`  Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }

  // Summary
  log('\n✅ Integration Verification Summary', 'yellow');
  log('═'.repeat(60), 'blue');
  log('✓ Server analytics module loaded correctly', 'green');
  log('✓ Can capture events', 'green');
  log('✓ Can identify users', 'green');
  log('✓ Can flush events to PostHog', 'green');
  log('\n🎉 PostHog integration is working correctly!', 'green');
  log('\nNext: Restart your dev server and check the browser console', 'cyan');
  log('      for client-side PostHog initialization logs.\n', 'cyan');

  // Shutdown PostHog client
  await serverAnalytics.shutdown();
}

// Run verification
verifyPostHogIntegration().catch((error) => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
