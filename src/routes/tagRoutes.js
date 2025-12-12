/**
 * Tag Routes
 * Public: List tags, get tag
 * Admin-only: Create, delete tags
 */

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/tags
 * @desc    List all tags or search by name (for autocomplete)
 * @access  Public
 * @query   { search?, limit? }
 */
router.get('/', tagController.listTags);

/**
 * @route   GET /api/tags/popular
 * @desc    Get popular tags by usage count
 * @access  Public
 * @query   { limit? }
 */
router.get('/popular', tagController.getPopularTags);

/**
 * @route   GET /api/tags/:id
 * @desc    Get single tag with article count
 * @access  Public
 */
router.get('/:id', tagController.getTag);

/**
 * @route   POST /api/tags
 * @desc    Create new tag (or return existing)
 * @access  Admin-only
 * @body    { name, slug? }
 * Note: Returns existing tag if name already exists
 */
router.post('/', verifyToken, verifyAdmin, tagController.createTag);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete tag (only if no articles use it)
 * @access  Admin-only
 */
router.delete('/:id', verifyToken, verifyAdmin, tagController.deleteTag);

module.exports = router;
