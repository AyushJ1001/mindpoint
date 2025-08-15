// Simple test script to verify rate limiting
// Run with: node test-rate-limit.js

const BASE_URL = 'http://localhost:3000';

async function testRateLimit() {
  console.log('Testing rate limiting...\n');

  // Test 1: Make multiple requests to trigger rate limit
  console.log('Test 1: Making multiple requests to trigger rate limit...');
  
  const promises = [];
  for (let i = 1; i <= 15; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          message: `Test message ${i}`,
        }),
      }).then(async (response) => {
        const data = await response.json();
        return {
          status: response.status,
          data,
          headers: {
            'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
            'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining'),
            'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
          },
        };
      })
    );
  }

  const results = await Promise.all(promises);
  
  console.log('\nResults:');
  results.forEach((result, index) => {
    console.log(`Request ${index + 1}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Rate Limit Headers:`, result.headers);
    if (result.status === 429) {
      console.log(`  Error: ${result.data.error}`);
      console.log(`  Retry After: ${result.data.retryAfter}s`);
    }
    console.log('');
  });

  // Test 2: Wait and try again
  console.log('Test 2: Waiting 5 seconds and trying again...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const retryResponse = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Retry Test',
      email: 'retry@example.com',
      message: 'Retry message',
    }),
  });

  const retryData = await retryResponse.json();
  console.log(`Retry Status: ${retryResponse.status}`);
  console.log(`Retry Data:`, retryData);
  console.log(`Rate Limit Headers:`, {
    'X-RateLimit-Limit': retryResponse.headers.get('X-RateLimit-Limit'),
    'X-RateLimit-Remaining': retryResponse.headers.get('X-RateLimit-Remaining'),
    'X-RateLimit-Reset': retryResponse.headers.get('X-RateLimit-Reset'),
  });
}

// Run the test
testRateLimit().catch(console.error);
