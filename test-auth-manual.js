/**
 * Manual Authentication Test Script
 * Quick verification of all auth endpoints
 * Run with: node test-auth-manual.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test1234',
  name: 'Manual Test User',
};

let tokens = {};
let userId = null;

// Color console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function testRegister() {
  try {
    log.info('Testing user registration...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);

    if (response.data.success && response.data.data.accessToken) {
      tokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
      userId = response.data.data.user.id;
      log.success('Registration successful');
      console.log('   - Access Token:', tokens.accessToken.substring(0, 20) + '...');
      console.log('   - Refresh Token:', tokens.refreshToken.substring(0, 20) + '...');
      console.log('   - User ID:', userId);
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Registration failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testLogin() {
  try {
    log.info('Testing user login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    if (response.data.success && response.data.data.accessToken) {
      tokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
      log.success('Login successful');
      console.log('   - New Access Token:', tokens.accessToken.substring(0, 20) + '...');
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testGetProfile() {
  try {
    log.info('Testing get profile...');
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (response.data.success && response.data.data.email === testUser.email) {
      log.success('Get profile successful');
      console.log('   - Email:', response.data.data.email);
      console.log('   - Name:', response.data.data.name);
      console.log('   - Role:', response.data.data.role);
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Get profile failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testUpdateProfile() {
  try {
    log.info('Testing update profile...');
    const updates = {
      name: 'Updated Test User',
      bio: 'This is my test bio',
    };

    const response = await axios.put(`${API_URL}/user/profile`, updates, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (response.data.success && response.data.data.name === updates.name) {
      log.success('Update profile successful');
      console.log('   - Updated Name:', response.data.data.name);
      console.log('   - Updated Bio:', response.data.data.bio);
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Update profile failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testRefreshToken() {
  try {
    log.info('Testing token refresh...');
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    if (response.data.success && response.data.data.accessToken) {
      const oldToken = tokens.accessToken;
      tokens.accessToken = response.data.data.accessToken;
      log.success('Token refresh successful');
      console.log('   - Old Token:', oldToken.substring(0, 20) + '...');
      console.log('   - New Token:', tokens.accessToken.substring(0, 20) + '...');
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Token refresh failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testInvalidToken() {
  try {
    log.info('Testing invalid token rejection...');
    await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: 'Bearer invalid-token-12345',
      },
    });
    log.error('Invalid token was accepted (should have been rejected)');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Invalid token correctly rejected');
      return true;
    }
    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

async function testWeakPassword() {
  try {
    log.info('Testing weak password rejection...');
    await axios.post(`${API_URL}/auth/register`, {
      email: `weak-${Date.now()}@example.com`,
      password: 'weak',
      name: 'Weak User',
    });
    log.error('Weak password was accepted (should have been rejected)');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      log.success('Weak password correctly rejected');
      return true;
    }
    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  Authentication Endpoints - Manual Test Suite');
  console.log('='.repeat(60) + '\n');

  const results = {
    passed: 0,
    failed: 0,
  };

  // Run tests sequentially
  const tests = [
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Refresh Token', fn: testRefreshToken },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Weak Password', fn: testWeakPassword },
  ];

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Test Results Summary');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.warn(`${results.failed} test(s) failed`);
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Check if server is running
axios.get('http://localhost:3000/health')
  .then(() => {
    log.success('Server is running');
    runAllTests();
  })
  .catch((error) => {
    log.error('Server is not running on http://localhost:3000');
    log.info('Please start the server with: npm run dev');
    process.exit(1);
  });
