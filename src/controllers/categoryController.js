/**
 * Category Controller
 * Handles blog category operations
 * Public: List categories
 * Admin-only: Create categories
 */

const { Category } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

class CategoryController {
  /**
   * List all categories
   * GET /api/categories
   * Public endpoint
   */
  async listCategories(req, res, next) {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'slug', 'createdAt'],
      });

      logger.info('Categories listed:', {
        count: categories.length,
      });

      successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new category
   * POST /api/categories
   * Admin-only endpoint
   */
  async createCategory(req, res, next) {
    try {
      const { name, slug } = req.body;

      if (!name) {
        throw new ValidationError('Category name is required');
      }

      // Check if category name already exists
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        throw new ValidationError('Category name already exists');
      }

      const category = await Category.create({
        name,
        slug: slug || undefined, // Let beforeValidate hook auto-generate if not provided
      });

      logger.info('Category created:', {
        categoryId: category.id,
        name: category.name,
        slug: category.slug,
      });

      successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category
   * PUT /api/categories/:id
   * Admin-only endpoint
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        throw new ValidationError('Category not found');
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug;

      await category.update(updates);

      logger.info('Category updated:', {
        categoryId: id,
        updates: Object.keys(updates),
      });

      successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category
   * DELETE /api/categories/:id
   * Admin-only endpoint
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        throw new ValidationError('Category not found');
      }

      // Check if category has articles
      const { Article } = require('../models');
      const articleCount = await Article.count({ where: { categoryId: id } });
      if (articleCount > 0) {
        throw new ValidationError(
          `Cannot delete category: ${articleCount} articles are using this category`
        );
      }

      await category.destroy();

      logger.info('Category deleted:', {
        categoryId: id,
        name: category.name,
      });

      successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
