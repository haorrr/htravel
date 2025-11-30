/**
 * Quick Test Script for Phase 08
 * Tests endpoint availability without requiring Google Maps API key
 *
 * Usage: node test-phase08-quick.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ANSI colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

async function quickTest() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Phase 08 - Quick Endpoint Availability Test${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Get place types (doesn't need API key)
  console.log('Test 1: Get available place types...');
  try {
    const response = await axios.get(`${BASE_URL}/places/types`);

    if (!response.data.success) {
      throw new Error('Failed to get place types');
    }

    const { types } = response.data.data;
    console.log(`${colors.green}✓ Place types endpoint works${colors.reset}`);
    console.log(`  Available types: ${types.length}`);
    console.log(`  Examples: ${types.slice(0, 5).join(', ')}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗ Place types test failed${colors.reset}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }

  // Test 2: Text search endpoint exists (expect error without API key)
  console.log('\nTest 2: Text search endpoint exists...');
  try {
    await axios.get(`${BASE_URL}/places/search`, {
      params: { query: 'test' },
    });
    // If it succeeds, API key is configured
    console.log(`${colors.green}✓ Text search endpoint works (API key configured)${colors.reset}`);
    testsPassed++;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.stack || error.response.data.error || '';
      if (error.response.status === 500 && errorMsg.includes('REQUEST_DENIED')) {
        console.log(`${colors.yellow}⚠ Text search endpoint exists but needs API key${colors.reset}`);
        console.log(`  Status: 500 - REQUEST_DENIED (expected)`);
        testsPassed++; // Endpoint exists and validates correctly
      } else if (error.response.status === 500 && errorMsg.includes('not configured')) {
        console.log(`${colors.yellow}⚠ Text search endpoint exists but needs API key${colors.reset}`);
        console.log(`  Status: Google Maps API key not configured`);
        testsPassed++;
      } else if (error.response.status === 400) {
        console.log(`${colors.green}✓ Text search endpoint validates input${colors.reset}`);
        testsPassed++;
      } else {
        console.log(`${colors.red}✗ Unexpected error${colors.reset}`);
        console.error(`  Error: ${error.message}`);
        testsFailed++;
      }
    } else {
      console.log(`${colors.red}✗ Network error${colors.reset}`);
      testsFailed++;
    }
  }

  // Test 3: Nearby search endpoint exists
  console.log('\nTest 3: Nearby search endpoint exists...');
  try {
    await axios.get(`${BASE_URL}/places/nearby`, {
      params: {
        lat: 21.028511,
        lng: 105.804817,
        radius: 5000,
      },
    });
    console.log(`${colors.green}✓ Nearby search endpoint works (API key configured)${colors.reset}`);
    testsPassed++;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.stack || error.response.data.error || '';
      if (error.response.status === 500 && (errorMsg.includes('REQUEST_DENIED') || errorMsg.includes('not configured'))) {
        console.log(`${colors.yellow}⚠ Nearby search endpoint exists but needs API key${colors.reset}`);
        console.log(`  Status: 500 - API key needed (expected)`);
        testsPassed++;
      } else if (error.response.status === 400) {
        console.log(`${colors.green}✓ Nearby search endpoint validates input${colors.reset}`);
        testsPassed++;
      } else {
        console.log(`${colors.red}✗ Unexpected error${colors.reset}`);
        console.error(`  Error: ${error.message}`);
        testsFailed++;
      }
    } else {
      console.log(`${colors.red}✗ Network error${colors.reset}`);
      testsFailed++;
    }
  }

  // Test 4: Validation - missing query
  console.log('\nTest 4: Query validation...');
  try {
    await axios.get(`${BASE_URL}/places/search`);
    throw new Error('Should have returned 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`${colors.green}✓ Query validation works${colors.reset}`);
      console.log(`  Error message: ${error.response.data.error}`);
      testsPassed++;
    } else {
      throw error;
    }
  }

  // Test 5: Validation - missing coordinates
  console.log('\nTest 5: Coordinate validation...');
  try {
    await axios.get(`${BASE_URL}/places/nearby`, {
      params: { radius: 5000 },
    });
    throw new Error('Should have returned 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`${colors.green}✓ Coordinate validation works${colors.reset}`);
      console.log(`  Error message: ${error.response.data.error}`);
      testsPassed++;
    } else {
      throw error;
    }
  }

  // Summary
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`Tests Passed: ${colors.green}${testsPassed}${colors.reset}`);
  console.log(`Tests Failed: ${colors.red}${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}✓ All endpoints available! Phase 08 is ready.${colors.reset}`);
    console.log(`\n${colors.yellow}⚠️  To test with real data, configure Google Maps API:${colors.reset}`);
    console.log(`  1. Get API key from: https://console.cloud.google.com/google/maps-apis`);
    console.log(`  2. Enable these APIs in Google Cloud Console:`);
    console.log(`     - Places API`);
    console.log(`     - Geocoding API (already used in Phase 05)`);
    console.log(`  3. Add to .env: GOOGLE_MAPS_API_KEY=your-key-here`);
    console.log(`  4. Restart server`);
    console.log(`  5. Run: node test-places-manual.js\n`);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Check errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run test
quickTest().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error.message);
  process.exit(1);
});
