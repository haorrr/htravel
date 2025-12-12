/**
 * Tag Controller
 * Handles tag operations for article tagging
 * Public: List tags
 * Admin-only: Create, delete tags
 */

const { Tag, Article, ArticleTag } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errorTypes');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class TagController {
  /**
   * List all tags or search by name (for autocomplete)
   * GET /api/tags?search=travel&limit=10
   * Public endpoint
   */
  async listTags(req, res, next) {
    try {
      const { search, limit } = req.query;
      const maxLimit = Math.min(parseInt(limit) || 50, 100);

      const where = {};
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const tags = await Tag.findAll({
        where,
        order: [['name', 'ASC']],
        limit: maxLimit,
        attributes: ['id', 'name', 'slug'],
      });

      logger.info('Tags listed:', {
        count: tags.length,
        search,
      });

      successResponse(res, tags, 'Tags retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tag with article count
   * GET /api/tags/:id
   * Public endpoint
   */
  async getTag(req, res, next) {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id, {
        attributes: ['id', 'name', 'slug', 'createdAt'],
      });

      if (!tag) {
        throw new ValidationError('Tag not found');
      }

      // Count articles using this tag
      const articleCount = await ArticleTag.count({ where: { tagId: id } });

      logger.info('Tag retrieved:', {
        tagId: id,
        name: tag.name,
        articleCount,
      });

      successResponse(res, {
        ...tag.toJSON(),
        articleCount,
      }, 'Tag retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new tag (or find existing)
   * POST /api/tags
   * Admin-only endpoint
   * Returns existing tag if name already exists
   */
  async createTag(req, res, next) {
    try {
      const { name, slug } = req.body;

      if (!name) {
        throw new ValidationError('Tag name is required');
      }

      // Check if tag already exists (case-insensitive)
      let tag = await Tag.findOne({
        where: { name: { [Op.like]: name } },
      });

      if (tag) {
        logger.info('Tag already exists, returning existing:', {
          tagId: tag.id,
          name: tag.name,
        });

        return successResponse(res, tag, 'Tag already exists', 200);
      }

      // Create new tag
      tag = await Tag.create({
        name,
        slug: slug || undefined, // Let beforeValidate hook auto-generate if not provided
      });

      logger.info('Tag created:', {
        tagId: tag.id,
        name: tag.name,
        slug: tag.slug,
      });

      successResponse(res, tag, 'Tag created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete tag
   * DELETE /api/tags/:id
   * Admin-only endpoint
   */
  async deleteTag(req, res, next) {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        throw new ValidationError('Tag not found');
      }

      // Check if tag is used by articles
      const articleCount = await ArticleTag.count({ where: { tagId: id } });
      if (articleCount > 0) {
        throw new ValidationError(
          `Cannot delete tag: ${articleCount} articles are using this tag`
        );
      }

      await tag.destroy();

      logger.info('Tag deleted:', {
        tagId: id,
        name: tag.name,
      });

      successResponse(res, null, 'Tag deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular tags (by usage count)
   * GET /api/tags/popular?limit=10
   * Public endpoint
   */
  async getPopularTags(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const tags = await Tag.findAll({
        attributes: [
          'id',
          'name',
          'slug',
          [sequelize.fn('COUNT', sequelize.col('articles.id')), 'articleCount'],
        ],
        include: [{
          model: Article,
          as: 'articles',
          attributes: [],
          through: { attributes: [] },
        }],
        group: ['Tag.id'],
        order: [[sequelize.literal('articleCount'), 'DESC']],
        limit,
        raw: true,
      });

      logger.info('Popular tags retrieved:', {
        count: tags.length,
      });

      successResponse(res, tags, 'Popular tags retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TagController();
