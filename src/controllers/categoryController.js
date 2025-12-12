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
   * List all categories (hierarchical or flat)
   * GET /api/categories?hierarchy=true
   * Public endpoint
   */
  async listCategories(req, res, next) {
    try {
      const { hierarchy } = req.query;

      if (hierarchy === 'true') {
        // Return hierarchical structure (parent with children)
        const rootCategories = await Category.findAll({
          where: { parentId: null },
          include: [{
            model: Category,
            as: 'children',
            attributes: ['id', 'name', 'slug', 'description', 'createdAt'],
          }],
          order: [
            ['name', 'ASC'],
            [{ model: Category, as: 'children' }, 'name', 'ASC'],
          ],
          attributes: ['id', 'name', 'slug', 'description', 'createdAt'],
        });

        logger.info('Hierarchical categories listed:', {
          count: rootCategories.length,
        });

        successResponse(res, rootCategories, 'Categories retrieved successfully');
      } else {
        // Return flat list with parent info
        const categories = await Category.findAll({
          include: [{
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'slug'],
          }],
          order: [['name', 'ASC']],
          attributes: ['id', 'name', 'slug', 'description', 'parentId', 'createdAt'],
        });

        logger.info('Categories listed:', {
          count: categories.length,
        });

        successResponse(res, categories, 'Categories retrieved successfully');
      }
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
      const { name, slug, parentId, description } = req.body;

      if (!name) {
        throw new ValidationError('Category name is required');
      }

      // Check if category name already exists
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        throw new ValidationError('Category name already exists');
      }

      // Validate parentId if provided
      if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) {
          throw new ValidationError('Invalid parentId - parent category does not exist');
        }

        // Prevent 3-level nesting (parent must be root)
        if (parent.parentId !== null) {
          throw new ValidationError('Cannot create subcategory: parent must be a root category (max 2 levels)');
        }
      }

      const category = await Category.create({
        name,
        slug: slug || undefined, // Let beforeValidate hook auto-generate if not provided
        parentId: parentId || null,
        description: description || null,
      });

      // Fetch with parent info
      const fullCategory = await Category.findByPk(category.id, {
        include: [{
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        }],
      });

      logger.info('Category created:', {
        categoryId: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      });

      successResponse(res, fullCategory, 'Category created successfully', 201);
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
      const { name, slug, parentId, description } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        throw new ValidationError('Category not found');
      }

      // Build updates object
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug;
      if (description !== undefined) updates.description = description;

      // Validate parentId if being updated
      if (parentId !== undefined) {
        if (parentId === null) {
          // Allow setting to root
          updates.parentId = null;
        } else {
          if (parseInt(parentId) === parseInt(id)) {
            throw new ValidationError('Category cannot be its own parent');
          }

          const parent = await Category.findByPk(parentId);
          if (!parent) {
            throw new ValidationError('Invalid parentId - parent category does not exist');
          }

          // Prevent 3-level nesting
          if (parent.parentId !== null) {
            throw new ValidationError('Cannot set parent: parent must be a root category (max 2 levels)');
          }

          // Check if category has children - cannot become a child if it has children
          const childCount = await Category.count({ where: { parentId: id } });
          if (childCount > 0) {
            throw new ValidationError('Cannot set parent: category has children (max 2 levels)');
          }

          updates.parentId = parentId;
        }
      }

      await category.update(updates);

      // Fetch updated category with parent info
      const updatedCategory = await Category.findByPk(id, {
        include: [{
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        }],
      });

      logger.info('Category updated:', {
        categoryId: id,
        updates: Object.keys(updates),
      });

      successResponse(res, updatedCategory, 'Category updated successfully');
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

      // Check if category has children
      const childCount = await Category.count({ where: { parentId: id } });
      if (childCount > 0) {
        throw new ValidationError(
          `Cannot delete category: ${childCount} subcategories exist`
        );
      }

      // Check if category has articles (legacy categoryId)
      const { Article, ArticleCategory } = require('../models');
      const articleCount = await Article.count({ where: { categoryId: id } });
      if (articleCount > 0) {
        throw new ValidationError(
          `Cannot delete category: ${articleCount} articles are using this category`
        );
      }

      // Check article_categories junction table
      const junctionCount = await ArticleCategory.count({ where: { categoryId: id } });
      if (junctionCount > 0) {
        throw new ValidationError(
          `Cannot delete category: ${junctionCount} article associations exist`
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
