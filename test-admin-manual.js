/**
 * Manual Test Script for Admin User Management API
 * Tests all admin endpoints with various scenarios
 *
 * Usage: node test-admin-manual.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials (must be configured in your database)
const ADMIN_CREDENTIALS = {
  email: 'admin@htravel.com',
  password: 'admin123456',
};

// Note: Create a regular user first via /api/auth/register endpoint
const USER_CREDENTIALS = {
  email: 'test@htravel.com',
  password: 'Test123456',
};

let adminToken = '';
let userToken = '';
let testUserId = '';

// Helper: Login and get token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.data.accessToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: GET /api/admin/users - List all users
async function testListUsers() {
  console.log('\n📋 TEST 1: List all users');
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Total users:', response.data.data.pagination.total);
    console.log('✅ Stats:', response.data.data.stats);
    console.log('✅ First user:', response.data.data.users[0]);

    // Save a test user ID for later tests
    const regularUser = response.data.data.users.find(u => u.role === 'user');
    if (regularUser) {
      testUserId = regularUser.id;
      console.log('✅ Test user ID saved:', testUserId);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: GET /api/admin/users with search
async function testSearchUsers() {
  console.log('\n🔍 TEST 2: Search users by email');
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { search: 'admin', limit: 5 },
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Search results:', response.data.data.users.length);
    console.log('✅ Users:', response.data.data.users.map(u => u.email));
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: GET /api/admin/users with role filter
async function testFilterByRole() {
  console.log('\n🎭 TEST 3: Filter users by role');
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { role: 'admin' },
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Admin users found:', response.data.data.pagination.total);
    console.log('✅ All are admins:', response.data.data.users.every(u => u.role === 'admin'));
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Non-admin access (should fail)
async function testNonAdminAccess() {
  console.log('\n🚫 TEST 4: Non-admin access (should fail with 403)');
  try {
    await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.error('❌ Should have failed but succeeded!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked with 403');
      return true;
    }
    console.error('❌ Wrong error:', error.response?.status);
    return false;
  }
}

// Test 5: PATCH /api/admin/users/:id/role - Update role
async function testUpdateUserRole() {
  console.log('\n🔄 TEST 5: Update user role');
  if (!testUserId) {
    console.log('⚠️ Skipped (no test user ID)');
    return true;
  }

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/users/${testUserId}/role`,
      { role: 'admin' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✅ Status:', response.status);
    console.log('✅ Updated user:', response.data.data.user.role);

    // Revert back to user
    await axios.patch(
      `${API_BASE_URL}/admin/users/${testUserId}/role`,
      { role: 'user' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Reverted back to user');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: PATCH own role (should fail)
async function testCannotChangeSelfRole() {
  console.log('\n🚫 TEST 6: Cannot change own role (should fail)');
  try {
    // Get admin's own ID
    const profileResponse = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminId = profileResponse.data.data.id;

    await axios.patch(
      `${API_BASE_URL}/admin/users/${adminId}/role`,
      { role: 'user' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.error('❌ Should have failed but succeeded!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked with 403:', error.response.data.error);
      return true;
    }
    console.error('❌ Wrong error:', error.response?.data);
    return false;
  }
}

// Test 7: Invalid role value (should fail)
async function testInvalidRoleValue() {
  console.log('\n🚫 TEST 7: Invalid role value (should fail with 400)');
  if (!testUserId) {
    console.log('⚠️ Skipped (no test user ID)');
    return true;
  }

  try {
    await axios.patch(
      `${API_BASE_URL}/admin/users/${testUserId}/role`,
      { role: 'superadmin' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.error('❌ Should have failed but succeeded!');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected with 400');
      console.log('✅ Error:', error.response.data.details);
      return true;
    }
    console.error('❌ Wrong error:', error.response?.status);
    return false;
  }
}

// Test 8: DELETE /api/admin/users/:id
async function testDeleteUser() {
  console.log('\n🗑️  TEST 8: Delete user (skipped to preserve data)');
  console.log('⚠️ To test deletion, manually create a test user first');
  console.log('⚠️ Then uncomment the deletion code below');

  // Uncomment to test actual deletion:
  // try {
  //   const response = await axios.delete(
  //     `${API_BASE_URL}/admin/users/${testUserId}`,
  //     { headers: { Authorization: `Bearer ${adminToken}` } }
  //   );
  //   console.log('✅ User deleted:', response.data.data.deletedUser);
  //   return true;
  // } catch (error) {
  //   console.error('❌ Failed:', error.response?.data || error.message);
  //   return false;
  // }

  return true;
}

// Test 9: DELETE own account (should fail)
async function testCannotDeleteSelf() {
  console.log('\n🚫 TEST 9: Cannot delete own account (should fail)');
  try {
    const profileResponse = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminId = profileResponse.data.data.id;

    await axios.delete(
      `${API_BASE_URL}/admin/users/${adminId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.error('❌ Should have failed but succeeded!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked with 403:', error.response.data.error);
      return true;
    }
    console.error('❌ Wrong error:', error.response?.data);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Admin API Tests...\n');
  console.log('=' .repeat(50));

  // Step 1: Login
  console.log('\n🔐 Logging in...');
  try {
    adminToken = await login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    console.log('✅ Admin logged in');

    userToken = await login(USER_CREDENTIALS.email, USER_CREDENTIALS.password);
    console.log('✅ User logged in');
  } catch (error) {
    console.error('\n❌ Login failed. Please ensure:');
    console.error('   1. Server is running (npm run dev)');
    console.error('   2. Admin user exists in database');
    console.error('   3. Regular user exists in database');
    console.error('\n   Run seeders or create users manually first.');
    process.exit(1);
  }

  // Run tests
  const results = [];

  results.push(await testListUsers());
  results.push(await testSearchUsers());
  results.push(await testFilterByRole());
  results.push(await testNonAdminAccess());
  results.push(await testUpdateUserRole());
  results.push(await testCannotChangeSelfRole());
  results.push(await testInvalidRoleValue());
  results.push(await testDeleteUser());
  results.push(await testCannotDeleteSelf());

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Review the output above.');
  }
}

// Execute tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
