// Simple direct Resend test without Convex
// Usage: ensure RESEND_API_KEY is set in .env, then:
//   node test-resend-direct.js

require('dotenv').config({ path: '.env' });

async function run() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set in environment');
    }
    const { Resend } = require('resend');
    const resend = new Resend(apiKey);

    const to = 'ayushjuvekar@gmail.com';
    const from = 'The Mind Point <no-reply@themindpoint.org>';
    const subject = 'Simple Test Email';
    const html = 'hi';

    console.log('➡️  Sending direct Resend email...');
    const result = await resend.emails.send({ from, to, subject, html });
    console.log('✅ Direct Resend email sent:', result);
  } catch (err) {
    console.error('❌ Direct Resend send failed:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    console.error('\nTroubleshooting:');
    console.error('- Ensure RESEND_API_KEY is set in .env');
    console.error('- Ensure no-reply@themindpoint.org is verified as a sender');
  }
}

if (require.main === module) run();

module.exports = { run };

