// Simple Resend email test via Convex action
// Usage: ensure NEXT_PUBLIC_CONVEX_URL is set in .env, then run:
//   node test-resend-email.js

require('dotenv').config({ path: '.env' });

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

async function run() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not set in environment');
    }

    const convex = new ConvexHttpClient(convexUrl);
    const to = 'ayushjuvekar@gmail.com';
    const body = 'hi';

    console.log('➡️  Triggering sendSimpleTestEmail action...');
    await convex.action(api.emailActions.sendSimpleTestEmail, { to, body });
    console.log('✅ Email action invoked successfully. Check inbox for delivery.');
  } catch (err) {
    console.error('❌ Failed to send test email:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    console.error('\nTroubleshooting:');
    console.error('- Ensure NEXT_PUBLIC_CONVEX_URL is set in .env');
    console.error('- Ensure RESEND_API_KEY is configured in your Convex environment');
    console.error('- Ensure no-reply@themindpoint.org domain is verified in Resend');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };

