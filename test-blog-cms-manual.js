/**
 * Manual Test Script for Blog CMS (Phase 06)
 * Tests article & category CRUD with admin authentication
 *
 * Prerequisites:
 * 1. Server running on port 3000
 * 2. Database migrated with admin user seeded
 * 3. Admin credentials: admin@htravel.com / admin123456
 *
 * Usage:
 * node test-blog-cms-manual.js
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
let adminToken = null;
let userToken = null;
let categoryId = null;
let articleId = null;

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
  log.section('📝 BLOG CMS TESTS - PHASE 06');

  // Test 1: Login as admin
  await runTest('Admin authentication', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@htravel.com',
      password: 'admin123456',
    });

    if (!response.data.success) {
      throw new Error('Admin login failed');
    }

    adminToken = response.data.data.accessToken;
    log.info(`   Admin token obtained: ${adminToken.substring(0, 20)}...`);
  });

  // Test 2: Create regular user for permission testing
  await runTest('Create regular user', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'user@test.com',
        password: 'Test1234',
        name: 'Regular User',
      });
      log.info(`   New user created`);
    } catch (error) {
      // User might already exist - that's okay
      if (error.response?.data?.error?.includes('already registered')) {
        log.info(`   User already exists, logging in`);
      } else {
        throw error;
      }
    }

    // Login to get token (whether new or existing user)
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@test.com',
      password: 'Test1234',
    });

    if (!loginResponse.data.success) {
      throw new Error('User login failed');
    }

    userToken = loginResponse.data.data.accessToken;
    log.info(`   User token obtained`);
  });

  // Test 3: Create category (admin) or use existing
  await runTest('Create category (admin only)', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/categories`, {
        name: 'Travel Tips',
        slug: 'travel-tips',
      }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.data.success) {
        throw new Error('Category creation failed');
      }

      categoryId = response.data.data.id;
      log.info(`   Category ID: ${categoryId}`);
      log.info(`   Category: ${response.data.data.name} (${response.data.data.slug})`);
    } catch (error) {
      // If category exists, fetch it
      if (error.response?.data?.error?.includes('already exists')) {
        const listResponse = await axios.get(`${BASE_URL}/categories`);
        const existingCategory = listResponse.data.data.find(c => c.slug === 'travel-tips');
        if (existingCategory) {
          categoryId = existingCategory.id;
          log.info(`   Using existing category ID: ${categoryId}`);
          return;
        }
      }
      throw error;
    }
  });

  // Test 4: List categories (public)
  await runTest('List categories (public)', async () => {
    const response = await axios.get(`${BASE_URL}/categories`);

    if (!response.data.success) {
      throw new Error('Failed to list categories');
    }

    log.info(`   Categories found: ${response.data.data.length}`);
  });

  // Test 5: Non-admin cannot create category
  await runTest('Non-admin cannot create category', async () => {
    try {
      await axios.post(`${BASE_URL}/categories`, {
        name: 'Unauthorized Category',
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      throw new Error('Should have rejected non-admin');
    } catch (error) {
      if (error.response?.status === 403) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 6: Create article (admin)
  await runTest('Create article with admin', async () => {
    // Use FormData because route expects multipart/form-data (for optional thumbnail)
    const formData = new FormData();
    formData.append('title', 'Top 10 Vietnamese Destinations');
    formData.append('content', 'Vietnam offers incredible destinations from beaches to mountains. Here are the top 10 places you must visit during your trip to Vietnam. Each destination offers unique experiences and unforgettable memories.');
    formData.append('categoryId', categoryId);

    const response = await axios.post(`${BASE_URL}/articles`, formData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders(),
      },
    });

    if (!response.data.success) {
      throw new Error('Article creation failed');
    }

    articleId = response.data.data.id;
    log.info(`   Article ID: ${articleId}`);
    log.info(`   Title: ${response.data.data.title}`);
    log.info(`   Author: ${response.data.data.author.name}`);
    log.info(`   Category: ${response.data.data.category.name}`);
  });

  // Test 7: List articles (public)
  await runTest('List articles (public)', async () => {
    const response = await axios.get(`${BASE_URL}/articles?page=1&limit=10`);

    if (!response.data.success) {
      throw new Error('Failed to list articles');
    }

    const { articles, pagination } = response.data.data;
    log.info(`   Total articles: ${pagination.total}`);
    log.info(`   Current page: ${pagination.page}/${pagination.totalPages}`);
  });

  // Test 8: Get single article (public)
  await runTest('Get single article (public)', async () => {
    const response = await axios.get(`${BASE_URL}/articles/${articleId}`);

    if (!response.data.success) {
      throw new Error('Failed to get article');
    }

    log.info(`   Article: ${response.data.data.title}`);
    log.info(`   Author: ${response.data.data.author.name}`);
  });

  // Test 9: Filter articles by category
  await runTest('Filter articles by category', async () => {
    const response = await axios.get(`${BASE_URL}/articles?categoryId=${categoryId}`);

    if (!response.data.success) {
      throw new Error('Failed to filter articles');
    }

    log.info(`   Articles in category: ${response.data.data.articles.length}`);
  });

  // Test 10: Search articles by title
  await runTest('Search articles by title', async () => {
    const response = await axios.get(`${BASE_URL}/articles?search=Vietnamese`);

    if (!response.data.success) {
      throw new Error('Search failed');
    }

    log.info(`   Search results: ${response.data.data.articles.length}`);
  });

  // Test 11: Update article (admin)
  await runTest('Update article (admin)', async () => {
    // Use FormData because route expects multipart/form-data (for optional thumbnail)
    const formData = new FormData();
    formData.append('title', 'Top 10 Vietnamese Destinations [Updated]');

    const response = await axios.put(`${BASE_URL}/articles/${articleId}`, formData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders(),
      },
    });

    if (!response.data.success) {
      throw new Error('Article update failed');
    }

    log.info(`   Updated title: ${response.data.data.title}`);
  });

  // Test 12: Non-admin cannot create article
  await runTest('Non-admin cannot create article', async () => {
    try {
      const formData = new FormData();
      formData.append('title', 'Unauthorized Article');
      formData.append('content', 'This should not be created');
      formData.append('categoryId', categoryId);

      await axios.post(`${BASE_URL}/articles`, formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          ...formData.getHeaders(),
        },
      });
      throw new Error('Should have rejected non-admin');
    } catch (error) {
      if (error.response?.status === 403) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 13: Non-admin cannot update article
  await runTest('Non-admin cannot update article', async () => {
    try {
      const formData = new FormData();
      formData.append('title', 'Hacked Title');

      await axios.put(`${BASE_URL}/articles/${articleId}`, formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          ...formData.getHeaders(),
        },
      });
      throw new Error('Should have rejected non-admin');
    } catch (error) {
      if (error.response?.status === 403) {
        // Expected behavior
        return;
      }
      throw error;
    }
  });

  // Test 14: Delete article (admin)
  await runTest('Delete article (admin)', async () => {
    const response = await axios.delete(`${BASE_URL}/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!response.data.success) {
      throw new Error('Article deletion failed');
    }

    log.info(`   Article deleted: ${articleId}`);
  });

  // Test 15: Verify article is deleted
  await runTest('Verify article is deleted', async () => {
    try {
      await axios.get(`${BASE_URL}/articles/${articleId}`);
      throw new Error('Article should have been deleted');
    } catch (error) {
      if (error.response?.status === 404) {
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
    log.success('🎉 ALL TESTS PASSED! Phase 06 is working correctly.');
    log.info('\n📋 Next Steps:');
    log.info('   1. ✅ Phase 06 (Blog CMS) is complete');
    log.info('   2. 🚀 Ready to proceed to Phase 07 (AI Virtual Travel)');
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
