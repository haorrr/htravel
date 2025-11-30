/**
 * Category Routes
 * Public: List categories
 * Admin-only: Create, update, delete categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/categories
 * @desc    List all categories (alphabetically sorted)
 * @access  Public
 */
router.get('/', categoryController.listCategories);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Admin-only
 * @body    { name, slug? }
 * Note: slug auto-generated from name if not provided
 */
router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Admin-only
 * @body    { name?, slug? }
 */
router.put('/:id', verifyToken, verifyAdmin, categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (only if no articles use it)
 * @access  Admin-only
 */
router.delete('/:id', verifyToken, verifyAdmin, categoryController.deleteCategory);

module.exports = router;
