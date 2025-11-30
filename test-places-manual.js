/**
 * Manual Test Script for Google Places (Phase 08)
 * Tests Google Maps Places API integration
 *
 * Prerequisites:
 * 1. Server running on port 3000
 * 2. GOOGLE_MAPS_API_KEY configured in .env
 *
 * Usage:
 * node test-places-manual.js
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

// Store test data
let placeId = null;

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
  log.section('🗺️  GOOGLE PLACES TESTS - PHASE 08');

  // Test 1: Get available place types
  await runTest('Get available place types', async () => {
    const response = await axios.get(`${BASE_URL}/places/types`);

    if (!response.data.success) {
      throw new Error('Failed to get place types');
    }

    const { types } = response.data.data;
    log.info(`   Available types: ${types.length}`);
    log.info(`   Examples: ${types.slice(0, 5).join(', ')}`);
  });

  // Test 2: Text search - restaurants in Hanoi
  await runTest('Text search - restaurants in Hanoi', async () => {
    const response = await axios.get(`${BASE_URL}/places/search`, {
      params: {
        query: 'restaurants in Hanoi, Vietnam',
      },
    });

    if (!response.data.success) {
      throw new Error('Text search failed');
    }

    const { results, count } = response.data.data;
    log.info(`   Found ${count} restaurants`);

    if (results.length > 0) {
      const firstPlace = results[0];
      placeId = firstPlace.placeId;
      log.info(`   First result: ${firstPlace.name}`);
      log.info(`   Address: ${firstPlace.address}`);
      log.info(`   Rating: ${firstPlace.rating || 'N/A'} (${firstPlace.ratingsCount} reviews)`);
      log.info(`   Place ID: ${placeId}`);
    }
  });

  // Test 3: Text search with location bias
  await runTest('Text search with location bias', async () => {
    const response = await axios.get(`${BASE_URL}/places/search`, {
      params: {
        query: 'coffee shops',
        lat: 21.028511, // Hanoi
        lng: 105.804817,
        radius: 5000, // 5km
      },
    });

    if (!response.data.success) {
      throw new Error('Text search with location failed');
    }

    const { results, count } = response.data.data;
    log.info(`   Found ${count} coffee shops near Hanoi`);

    if (results.length > 0) {
      log.info(`   First result: ${results[0].name}`);
    }
  });

  // Test 4: Text search with type filter
  await runTest('Text search with type filter', async () => {
    const response = await axios.get(`${BASE_URL}/places/search`, {
      params: {
        query: 'Ho Chi Minh City',
        type: 'museum',
      },
    });

    if (!response.data.success) {
      throw new Error('Text search with type failed');
    }

    const { results, count } = response.data.data;
    log.info(`   Found ${count} museums`);
  });

  // Test 5: Nearby search - tourist attractions near Ha Long Bay
  await runTest('Nearby search - tourist attractions', async () => {
    const response = await axios.get(`${BASE_URL}/places/nearby`, {
      params: {
        lat: 20.910168, // Ha Long Bay
        lng: 107.184357,
        radius: 10000, // 10km
        type: 'tourist_attraction',
      },
    });

    if (!response.data.success) {
      throw new Error('Nearby search failed');
    }

    const { results, count } = response.data.data;
    log.info(`   Found ${count} tourist attractions`);

    if (results.length > 0) {
      log.info(`   Examples:`);
      results.slice(0, 3).forEach((place, idx) => {
        log.info(`     ${idx + 1}. ${place.name} - ${place.rating || 'N/A'}⭐`);
      });
    }
  });

  // Test 6: Nearby search with keyword
  await runTest('Nearby search with keyword', async () => {
    const response = await axios.get(`${BASE_URL}/places/nearby`, {
      params: {
        lat: 10.762622, // Ho Chi Minh City
        lng: 106.660172,
        radius: 5000,
        type: 'restaurant',
        keyword: 'pho',
      },
    });

    if (!response.data.success) {
      throw new Error('Nearby search with keyword failed');
    }

    const { results, count } = response.data.data;
    log.info(`   Found ${count} pho restaurants`);
  });

  // Test 7: Get place details (if we have a placeId from previous tests)
  if (placeId) {
    await runTest('Get place details', async () => {
      const response = await axios.get(`${BASE_URL}/places/details/${placeId}`);

      if (!response.data.success) {
        throw new Error('Get place details failed');
      }

      const place = response.data.data;
      log.info(`   Name: ${place.name}`);
      log.info(`   Address: ${place.address}`);
      log.info(`   Rating: ${place.rating || 'N/A'} (${place.ratingsCount} reviews)`);
      log.info(`   Phone: ${place.phoneNumber || 'N/A'}`);
      log.info(`   Website: ${place.website || 'N/A'}`);
      log.info(`   Open now: ${place.openingHours?.openNow ? 'Yes' : 'No'}`);
      log.info(`   Reviews: ${place.reviews.length}`);
      log.info(`   Photos: ${place.photos.length}`);

      if (place.reviews.length > 0) {
        log.info(`   Latest review: "${place.reviews[0].text.substring(0, 80)}..."`);
      }
    });
  } else {
    log.warning('Skipping place details test - no placeId available');
  }

  // Test 8: Query validation - missing query
  await runTest('Query validation - missing query', async () => {
    try {
      await axios.get(`${BASE_URL}/places/search`);
      throw new Error('Should have rejected request without query');
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 9: Nearby validation - missing coordinates
  await runTest('Nearby validation - missing coordinates', async () => {
    try {
      await axios.get(`${BASE_URL}/places/nearby`, {
        params: { radius: 5000 },
      });
      throw new Error('Should have rejected request without coordinates');
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 10: Nearby validation - missing radius
  await runTest('Nearby validation - missing radius', async () => {
    try {
      await axios.get(`${BASE_URL}/places/nearby`, {
        params: {
          lat: 21.028511,
          lng: 105.804817,
        },
      });
      throw new Error('Should have rejected request without radius');
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Print summary
  log.section('📊 TEST SUMMARY');
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%\n`);

  if (testsFailed === 0) {
    log.success('🎉 ALL TESTS PASSED! Phase 08 is working correctly.');
    log.info('\n📋 Next Steps:');
    log.info('   1. ✅ Phase 08 (Google Maps Integration) is complete');
    log.info('   2. 🚀 Ready to proceed to Phase 09 (Deployment)');
    log.info('\n💡 Integration Examples:');
    log.info('   - Combine with check-ins: search places → check-in');
    log.info('   - Combine with virtual travel: find destinations → generate photos');
    log.info('   - Build trip planner: search → add to itinerary → map view');
  } else {
    log.error('❌ Some tests failed. Please check the errors above.');
    log.warning('\n⚠️  Common Issues:');
    log.warning('   - GOOGLE_MAPS_API_KEY not configured in .env');
    log.warning('   - Google Maps API not enabled in Google Cloud Console');
    log.warning('   - API quota exceeded (check Google Cloud Console)');
    log.warning('   - Billing not enabled for Google Maps Platform');
  }

  process.exit(testsFailed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  log.error('Fatal error running tests:');
  console.error(error);
  process.exit(1);
});
