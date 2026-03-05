// Smoke test for admin route protection
// Run with: node test-admin-route-protection.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  console.log(`Testing unauthenticated access to ${BASE_URL}/admin`);

  const response = await fetch(`${BASE_URL}/admin`, {
    redirect: 'manual',
  });

  console.log('Status:', response.status);
  console.log('Location header:', response.headers.get('location'));

  const ok =
    response.status === 307 ||
    response.status === 302 ||
    response.status === 401 ||
    response.status === 403;

  if (!ok) {
    console.error('Unexpected response. Admin route may not be protected.');
    process.exit(1);
  }

  console.log('Admin route protection check passed.');
}

run().catch((error) => {
  console.error('Failed to run admin protection check:', error);
  process.exit(1);
});
