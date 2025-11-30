/**
 * Manual Test Script for Virtual Travel (Phase 07)
 * Tests AI-powered virtual travel photo generation using Imagen 4.0
 *
 * Prerequisites:
 * 1. Server running on port 3000
 * 2. GEMINI_API_KEY configured in .env
 * 3. Test selfie image available
 * 4. User registered and authenticated
 *
 * Usage:
 * node test-virtual-travel-manual.js [path-to-selfie-image]
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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
let userToken = null;
let virtualTripId = null;
const selfieImagePath = process.argv[2];

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
  log.section('🎨 VIRTUAL TRAVEL TESTS - PHASE 07');

  // Validate selfie image
  if (!selfieImagePath) {
    log.error('Usage: node test-virtual-travel-manual.js [path-to-selfie-image]');
    log.info('Example: node test-virtual-travel-manual.js ./test-images/selfie.jpg');
    process.exit(1);
  }

  if (!fs.existsSync(selfieImagePath)) {
    log.error(`Selfie image not found: ${selfieImagePath}`);
    log.info('Please provide a valid path to a selfie image');
    process.exit(1);
  }

  log.info(`Using selfie image: ${selfieImagePath}`);
  log.info(`File size: ${(fs.statSync(selfieImagePath).size / 1024).toFixed(2)} KB`);

  // Test 1: User authentication
  await runTest('User authentication', async () => {
    // Try to login with existing user, or register new one
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@htravel.com',
        password: 'Test1234',
      });
      userToken = loginResponse.data.data.accessToken;
      log.info(`   Logged in as existing user`);
    } catch (error) {
      // User doesn't exist, register new one
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'testuser@htravel.com',
        password: 'Test1234',
        name: 'Test User',
      });

      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@htravel.com',
        password: 'Test1234',
      });
      userToken = loginResponse.data.data.accessToken;
      log.info(`   Registered and logged in new user`);
    }
  });

  // Test 2: Check AI service status
  await runTest('Check AI service status', async () => {
    const response = await axios.get(`${BASE_URL}/ai/status`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (!response.data.success) {
      throw new Error('Failed to get AI status');
    }

    const { gemini, imagen } = response.data.data;

    log.info(`   Gemini: ${gemini.enabled ? 'Enabled' : 'Disabled'} (${gemini.circuitBreaker})`);
    log.info(`   Imagen: ${imagen.enabled ? 'Enabled' : 'Disabled'} (${imagen.circuitBreaker})`);

    if (!imagen.enabled) {
      throw new Error('Imagen service is not enabled - check GEMINI_API_KEY');
    }
  });

  // Test 3: Generate virtual travel photo (Main Test!)
  await runTest('Generate virtual travel photo - Tháp Eiffel', async () => {
    const formData = new FormData();
    formData.append('selfie', fs.createReadStream(selfieImagePath));
    formData.append('destination', 'Tháp Eiffel, Paris, Pháp');

    log.info(`   Uploading selfie and generating virtual travel photo...`);
    log.warning(`   This may take 30-60 seconds (Imagen API is slow)...`);

    const response = await axios.post(`${BASE_URL}/ai/virtual-travel`, formData, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 minutes timeout
    });

    if (!response.data.success) {
      throw new Error('Virtual travel generation failed');
    }

    const data = response.data.data;
    virtualTripId = data.id;

    log.info(`   Virtual trip ID: ${virtualTripId}`);
    log.info(`   Destination: ${data.destination}`);
    log.info(`   Original image: ${data.originalImage}`);
    log.info(`   Generated images (${data.generatedImages.length}):`);
    data.generatedImages.forEach((img, idx) => {
      log.info(`     ${idx + 1}. ${img}`);
    });
    log.info(`   Created: ${new Date(data.createdAt).toLocaleString()}`);
  });

  // Test 4: Generate virtual travel photo - Vietnamese destination
  await runTest('Generate virtual travel photo - Vịnh Hạ Long', async () => {
    const formData = new FormData();
    formData.append('selfie', fs.createReadStream(selfieImagePath));
    formData.append('destination', 'Vịnh Hạ Long, Quảng Ninh, Việt Nam');

    log.info(`   Generating second virtual travel photo...`);
    log.warning(`   This may take 30-60 seconds...`);

    const response = await axios.post(`${BASE_URL}/ai/virtual-travel`, formData, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        ...formData.getHeaders(),
      },
      timeout: 120000,
    });

    if (!response.data.success) {
      throw new Error('Virtual travel generation failed');
    }

    const data = response.data.data;
    log.info(`   Destination: ${data.destination}`);
    log.info(`   Generated ${data.generatedImages.length} variations`);
  });

  // Test 5: Get virtual travel history
  await runTest('Get virtual travel history', async () => {
    const response = await axios.get(`${BASE_URL}/ai/virtual-travel/history?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (!response.data.success) {
      throw new Error('Failed to get history');
    }

    const { trips, pagination } = response.data.data;
    log.info(`   Total trips: ${pagination.total}`);
    log.info(`   Current page: ${pagination.page}/${pagination.totalPages}`);

    if (trips.length > 0) {
      log.info(`   Recent trips:`);
      trips.slice(0, 3).forEach((trip, idx) => {
        log.info(`     ${idx + 1}. ${trip.destinationName} (${new Date(trip.createdAt).toLocaleString()})`);
      });
    }
  });

  // Test 6: Authentication required
  await runTest('Authentication required for virtual travel', async () => {
    const formData = new FormData();
    formData.append('selfie', fs.createReadStream(selfieImagePath));
    formData.append('destination', 'Tokyo Tower');

    try {
      await axios.post(`${BASE_URL}/ai/virtual-travel`, formData, {
        headers: formData.getHeaders(),
        timeout: 5000,
      });
      throw new Error('Should have rejected unauthenticated request');
    } catch (error) {
      if (error.response?.status === 401) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 7: Destination required
  await runTest('Destination name is required', async () => {
    const formData = new FormData();
    formData.append('selfie', fs.createReadStream(selfieImagePath));
    // No destination

    try {
      await axios.post(`${BASE_URL}/ai/virtual-travel`, formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          ...formData.getHeaders(),
        },
        timeout: 5000,
      });
      throw new Error('Should have rejected request without destination');
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 8: Selfie image required
  await runTest('Selfie image is required', async () => {
    const formData = new FormData();
    formData.append('destination', 'Taj Mahal');
    // No selfie

    try {
      await axios.post(`${BASE_URL}/ai/virtual-travel`, formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          ...formData.getHeaders(),
        },
        timeout: 5000,
      });
      throw new Error('Should have rejected request without selfie');
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
    log.success('🎉 ALL TESTS PASSED! Phase 07 is working correctly.');
    log.info('\n📋 Next Steps:');
    log.info('   1. ✅ Phase 07 (AI Virtual Travel) is complete');
    log.info('   2. 🚀 Ready to proceed to Phase 08 (Google Maps Integration)');
    log.info('\n📸 Generated Images:');
    log.info('   Check ./uploads/virtual-travel/ for generated images');
    log.info('   Access via: http://localhost:3000/uploads/virtual-travel/[filename]');
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
