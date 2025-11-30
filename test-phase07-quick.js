/**
 * Quick Test Script for Phase 07
 * Tests endpoint availability without making actual Imagen API calls
 *
 * Usage: node test-phase07-quick.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ANSI colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

async function quickTest() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Phase 07 - Quick Endpoint Availability Test${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Login as admin
  console.log('Test 1: Login as admin...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@htravel.com',
      password: 'admin123456',
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const adminToken = loginResponse.data.data.accessToken;
    console.log(`${colors.green}✓ Login successful${colors.reset}`);
    testsPassed++;

    // Test 2: Check AI service status (includes Imagen)
    console.log('\nTest 2: Check AI service status...');
    const statusResponse = await axios.get(`${BASE_URL}/ai/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!statusResponse.data.success) {
      throw new Error('Status check failed');
    }

    const { gemini, imagen } = statusResponse.data.data;
    console.log(`${colors.green}✓ AI service status retrieved${colors.reset}`);
    console.log(`  - Gemini: ${gemini.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Imagen: ${imagen.enabled ? 'Enabled' : 'Disabled'}`);

    if (!imagen.enabled) {
      console.log(`${colors.red}⚠ Warning: Imagen service not enabled (check GEMINI_API_KEY)${colors.reset}`);
    }
    testsPassed++;

    // Test 3: Virtual travel endpoint exists (expect 400 for missing data)
    console.log('\nTest 3: Virtual travel endpoint exists...');
    try {
      await axios.post(`${BASE_URL}/ai/virtual-travel`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      // If no error, something is wrong
      throw new Error('Should have returned 400');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected - endpoint exists and validates input
        console.log(`${colors.green}✓ Virtual travel endpoint exists and validates input${colors.reset}`);
        console.log(`  Error message: ${error.response.data.error}`);
        testsPassed++;
      } else {
        throw error;
      }
    }

    // Test 4: Virtual travel history endpoint exists
    console.log('\nTest 4: Virtual travel history endpoint exists...');
    const historyResponse = await axios.get(`${BASE_URL}/ai/virtual-travel/history`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!historyResponse.data.success) {
      throw new Error('History endpoint failed');
    }

    console.log(`${colors.green}✓ Virtual travel history endpoint works${colors.reset}`);
    console.log(`  Total trips: ${historyResponse.data.data.pagination.total}`);
    testsPassed++;

    // Test 5: Authentication required for virtual travel
    console.log('\nTest 5: Authentication required...');
    try {
      await axios.post(`${BASE_URL}/ai/virtual-travel`, {});
      throw new Error('Should have returned 401');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`${colors.green}✓ Authentication properly enforced${colors.reset}`);
        testsPassed++;
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.log(`${colors.red}✗ Test failed${colors.reset}`);
    console.error(`  Error: ${error.message}`);
    if (error.response?.data) {
      console.error(`  Response:`, error.response.data);
    }
    testsFailed++;
  }

  // Summary
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`Tests Passed: ${colors.green}${testsPassed}${colors.reset}`);
  console.log(`Tests Failed: ${colors.red}${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}✓ All endpoints available! Phase 07 is ready for testing.${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Prepare a selfie image (JPEG/PNG)`);
    console.log(`  2. Run full test: node test-virtual-travel-manual.js ./test-images/selfie.jpg`);
    console.log(`  3. Check generated images in ./uploads/virtual-travel/\n`);
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
