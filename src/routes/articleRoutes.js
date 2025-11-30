/**
 * Article Routes
 * Public: List & view articles
 * Admin-only: Create, update, delete articles
 */

const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { uploadThumbnail, processThumbnail } = require('../middleware/uploadMiddleware');

/**
 * @route   GET /api/articles
 * @desc    List articles with pagination, filtering, and search
 * @access  Public
 * @query   page (default: 1), limit (default: 10, max: 100)
 * @query   categoryId (filter by category)
 * @query   search (search by title, case-insensitive)
 */
router.get('/', articleController.listArticles);

/**
 * @route   GET /api/articles/:id
 * @desc    Get single article by ID with author & category details
 * @access  Public
 */
router.get('/:id', articleController.getArticle);

/**
 * @route   POST /api/articles
 * @desc    Create new article with optional thumbnail
 * @access  Admin-only
 * @body    { title, content, categoryId }
 * @file    thumbnail (optional, max 5MB, JPEG/PNG)
 */
router.post(
  '/',
  verifyToken,
  verifyAdmin,
  uploadThumbnail,
  processThumbnail,
  articleController.createArticle
);

/**
 * @route   PUT /api/articles/:id
 * @desc    Update article (title, content, categoryId, or thumbnail)
 * @access  Admin-only
 * @body    { title?, content?, categoryId? }
 * @file    thumbnail (optional, replaces existing)
 */
router.put(
  '/:id',
  verifyToken,
  verifyAdmin,
  uploadThumbnail,
  processThumbnail,
  articleController.updateArticle
);

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete article by ID
 * @access  Admin-only
 */
router.delete('/:id', verifyToken, verifyAdmin, articleController.deleteArticle);

/**
 * @route   GET /api/articles/stats
 * @desc    Get article statistics (total, by category)
 * @access  Admin-only
 */
router.get('/stats', verifyToken, verifyAdmin, articleController.getStats);

module.exports = router;
