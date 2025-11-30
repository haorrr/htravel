/**
 * Article Controller
 * Handles blog article CRUD operations
 * Public: List & view articles
 * Admin-only: Create, update, delete articles
 */

const { Article, User, Category } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { NotFoundError, ValidationError } = require('../utils/errorTypes');
const { PAGINATION } = require('../config/constants');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ArticleController {
  /**
   * List articles with pagination, filtering, and search
   * GET /api/articles?page=1&limit=10&categoryId=1&search=beach
   * Public endpoint
   */
  async listArticles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const offset = (page - 1) * limit;
      const { categoryId, search } = req.query;

      const where = {};
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      logger.info('Articles listed:', {
        count,
        page,
        categoryId,
        search,
      });

      successResponse(res, {
        articles: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      }, 'Articles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single article by ID
   * GET /api/articles/:id
   * Public endpoint
   */
  async getArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await Article.findByPk(id, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl', 'bio'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        ],
      });

      if (!article) {
        throw new NotFoundError('Article not found');
      }

      logger.info('Article retrieved:', {
        articleId: id,
        title: article.title,
      });

      successResponse(res, article, 'Article retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new article
   * POST /api/articles
   * Admin-only endpoint
   */
  async createArticle(req, res, next) {
    try {
      const { title, content, categoryId } = req.body;

      if (!title || !content || !categoryId) {
        throw new ValidationError('Title, content, and categoryId are required');
      }

      // Verify category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new ValidationError('Invalid categoryId - category does not exist');
      }

      const article = await Article.create({
        title,
        content,
        categoryId,
        authorId: req.user.id,
        thumbnailUrl: req.file?.url || null,
      });

      // Fetch full article with associations
      const fullArticle = await Article.findByPk(article.id, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        ],
      });

      logger.info('Article created:', {
        articleId: article.id,
        title: article.title,
        authorId: req.user.id,
      });

      successResponse(res, fullArticle, 'Article created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update article
   * PUT /api/articles/:id
   * Admin-only endpoint
   */
  async updateArticle(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, categoryId } = req.body;

      const article = await Article.findByPk(id);
      if (!article) {
        throw new NotFoundError('Article not found');
      }

      // Build updates object
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (categoryId !== undefined) {
        // Verify category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
          throw new ValidationError('Invalid categoryId - category does not exist');
        }
        updates.categoryId = categoryId;
      }
      if (req.file) updates.thumbnailUrl = req.file.url;

      await article.update(updates);

      // Fetch updated article with associations
      const updatedArticle = await Article.findByPk(id, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        ],
      });

      logger.info('Article updated:', {
        articleId: id,
        updates: Object.keys(updates),
      });

      successResponse(res, updatedArticle, 'Article updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete article
   * DELETE /api/articles/:id
   * Admin-only endpoint
   */
  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await Article.findByPk(id);
      if (!article) {
        throw new NotFoundError('Article not found');
      }

      await article.destroy();

      logger.info('Article deleted:', {
        articleId: id,
        title: article.title,
      });

      successResponse(res, null, 'Article deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get article statistics
   * GET /api/articles/stats
   * Admin-only endpoint
   */
  async getStats(req, res, next) {
    try {
      const totalArticles = await Article.count();
      const articlesByCategory = await Article.findAll({
        attributes: [
          'categoryId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
        ],
        group: ['categoryId', 'category.id'],
        raw: true,
      });

      successResponse(res, {
        totalArticles,
        articlesByCategory,
      }, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArticleController();
