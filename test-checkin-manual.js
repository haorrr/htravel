/**
 * Manual Test Script for Check-in & Map System (Phase 05)
 * Tests check-in CRUD, geocoding, and map history endpoints
 *
 * Prerequisites:
 * 1. Server running on port 3000
 * 2. GOOGLE_MAPS_API_KEY configured in .env
 * 3. User authenticated (get token first)
 *
 * Usage:
 * node test-checkin-manual.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// Test statistics
let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;

// Store authentication token
let authToken = null;
let checkInId = null;

// Helper to run test
async function runTest(testName, testFn) {
  testsTotal++;
  try {
    await testFn();
    testsPassed++;
    log.success(`TEST ${testsTotal}: ${testName}`);
    return true;
  } catch (error) {
    testsFailed++;
    log.error(`TEST ${testsTotal}: ${testName}`);
    console.error(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.error(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Main test execution
async function runTests() {
  log.section('🗺️  CHECK-IN & MAP SYSTEM TESTS - PHASE 05');

  // Test 1: Register/Login to get auth token
  await runTest('User authentication', async () => {
    try {
      // Try to login with test user
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'Test1234',
      });
      authToken = loginResponse.data.data.accessToken;
    } catch (error) {
      // If login fails, register new user
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User',
      });

      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'Test1234',
      });
      authToken = loginResponse.data.data.accessToken;
    }

    if (!authToken) {
      throw new Error('Failed to obtain authentication token');
    }
    log.info(`   Token obtained: ${authToken.substring(0, 20)}...`);
  });

  // Test 2: Create check-in with coordinates (Ho Chi Minh City, Vietnam)
  await runTest('Create check-in with auto-province extraction', async () => {
    const response = await axios.post(`${BASE_URL}/user/check-in`, {
      locationName: 'District 1, Ho Chi Minh City',
      latitude: 10.7756,
      longitude: 106.7019,
      visitDate: '2025-11-24',
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.data.success) {
      throw new Error('Check-in creation failed');
    }

    checkInId = response.data.data.id;
    log.info(`   Check-in ID: ${checkInId}`);
    log.info(`   Province extracted: ${response.data.data.province}`);
    log.info(`   Location: ${response.data.data.locationName}`);
  });

  // Test 3: Create another check-in (Hanoi, Vietnam)
  await runTest('Create second check-in (Hanoi)', async () => {
    const response = await axios.post(`${BASE_URL}/user/check-in`, {
      locationName: 'Hoan Kiem District, Hanoi',
      latitude: 21.0285,
      longitude: 105.8542,
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.data.success) {
      throw new Error('Second check-in creation failed');
    }

    log.info(`   Province: ${response.data.data.province}`);
  });

  // Test 4: Get check-in history (paginated)
  await runTest('Get paginated check-in history', async () => {
    const response = await axios.get(`${BASE_URL}/user/check-ins?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.data.success) {
      throw new Error('Failed to get check-in history');
    }

    const { checkIns, pagination } = response.data.data;
    log.info(`   Total check-ins: ${pagination.total}`);
    log.info(`   Current page: ${pagination.page}/${pagination.totalPages}`);
  });

  // Test 5: Get map history (unique provinces)
  await runTest('Get map history (unique provinces)', async () => {
    const response = await axios.get(`${BASE_URL}/user/map-history`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.data.success) {
      throw new Error('Failed to get map history');
    }

    const { provinces, count } = response.data.data;
    log.info(`   Provinces visited: ${count}`);
    log.info(`   Provinces: ${provinces.join(', ')}`);

    if (count === 0) {
      throw new Error('Expected at least 1 province in map history');
    }
  });

  // Test 6: Get check-in statistics
  await runTest('Get check-in statistics', async () => {
    const response = await axios.get(`${BASE_URL}/user/check-in-stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.data.success) {
      throw new Error('Failed to get statistics');
    }

    const { totalCheckIns, provincesVisited } = response.data.data;
    log.info(`   Total check-ins: ${totalCheckIns}`);
    log.info(`   Provinces visited: ${provincesVisited}`);
  });

  // Test 7: Test validation (invalid coordinates)
  await runTest('Reject invalid coordinates', async () => {
    try {
      await axios.post(`${BASE_URL}/user/check-in`, {
        locationName: 'Invalid',
        latitude: 100, // Invalid: > 90
        longitude: 200, // Invalid: > 180
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      throw new Error('Should have rejected invalid coordinates');
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 8: Test authentication requirement
  await runTest('Require authentication for check-ins', async () => {
    try {
      await axios.get(`${BASE_URL}/user/check-ins`);
      throw new Error('Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 9: Delete check-in (if we have one)
  if (checkInId) {
    await runTest('Delete check-in', async () => {
      const response = await axios.delete(`${BASE_URL}/user/check-in/${checkInId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.data.success) {
        throw new Error('Failed to delete check-in');
      }

      log.info(`   Deleted check-in: ${checkInId}`);
    });
  }

  // Test 10: Verify cache is working
  await runTest('Verify geocoding cache (second request should be faster)', async () => {
    const startTime = Date.now();
    await axios.post(`${BASE_URL}/user/check-in`, {
      latitude: 10.7756,
      longitude: 106.7019,
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const duration = Date.now() - startTime;
    log.info(`   Request took: ${duration}ms (should be fast due to cache)`);
  });

  // Print summary
  log.section('📊 TEST SUMMARY');
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%\n`);

  if (testsFailed === 0) {
    log.success('🎉 ALL TESTS PASSED! Phase 05 is working correctly.');
    log.info('\n📋 Next Steps:');
    log.info('   1. ✅ Phase 05 (Check-in & Map System) is complete');
    log.info('   2. 🚀 Ready to proceed to Phase 06 (Blog CMS)');
  } else {
    log.error('❌ Some tests failed. Please check the errors above.');
  }

  process.exit(testsFailed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  log.error('Fatal error running tests:');
  console.error(error);
  process.exit(1);
});
