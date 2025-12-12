/**
 * Article Controller
 * Handles blog article CRUD operations
 * Public: List & view articles
 * Admin-only: Create, update, delete articles
 */

const { Article, User, Category, Tag, ArticleCategory, ArticleTag, sequelize } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { NotFoundError, ValidationError } = require('../utils/errorTypes');
const { PAGINATION } = require('../config/constants');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ArticleController {
  /**
   * List articles with pagination, filtering, and search
   * GET /api/articles?page=1&limit=10&categoryId=1&status=published&isFeatured=true&search=beach
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
      const { categoryId, status, isFeatured, search } = req.query;

      const where = {};

      // Filter by status (draft/published)
      if (status) {
        where.status = status;
      } else {
        // Default: only show published articles for public endpoint
        where.status = 'published';
      }

      // Filter by featured
      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured === 'true';
      }

      // Legacy single category filter
      if (categoryId) where.categoryId = categoryId;

      // Search by title or slug
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug'],
          },
        ],
        order: [
          ['isFeatured', 'DESC'], // Featured articles first
          ['publishedAt', 'DESC'], // Then by publish date
          ['createdAt', 'DESC'], // Fallback to creation date
        ],
        limit,
        offset,
      });

      logger.info('Articles listed:', {
        count,
        page,
        categoryId,
        status,
        isFeatured,
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
   * Get single article by ID or slug
   * GET /api/articles/:id
   * Public endpoint - increments view count
   */
  async getArticle(req, res, next) {
    try {
      const { id } = req.params;

      // Find by ID or slug
      const where = {};
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        where.id = id;
      } else {
        where.slug = id;
      }

      const article = await Article.findOne({
        where,
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl', 'bio'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug', 'description'],
          },
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug'],
          },
        ],
      });

      if (!article) {
        throw new NotFoundError('Article not found');
      }

      // Increment view count atomically
      await article.increment('viewCount');

      logger.info('Article retrieved:', {
        articleId: article.id,
        title: article.title,
        viewCount: article.viewCount + 1,
      });

      // Refresh to get updated viewCount
      await article.reload();

      successResponse(res, article, 'Article retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new article
   * POST /api/articles
   * Admin-only endpoint
   * Body: { title, content, categoryId, categoryIds, tagIds, slug, metaDescription, metaKeywords, status, isFeatured }
   */
  async createArticle(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    let {
      title,
      content,
      categoryId,   // Có thể bị thiếu từ Frontend
      categoryIds,  // Frontend thường gửi cái này (mảng)
      tagIds,
      slug,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
    } = req.body;

    // --- LOGIC MỚI: Tự động lấy categoryId từ categoryIds nếu bị thiếu ---
    
    // 1. Xử lý categoryIds nếu nó bị gửi dạng chuỗi JSON (do FormData)
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds);
      } catch (e) {
        categoryIds = [categoryIds];
      }
    }

    // 2. Nếu không có categoryId nhưng có categoryIds, lấy phần tử đầu tiên làm chính
    if (!categoryId && categoryIds && categoryIds.length > 0) {
      categoryId = categoryIds[0];
    }

    // 3. Kiểm tra lại lần cuối
    if (!title || !content || !categoryId) {
      throw new ValidationError('Tiêu đề, nội dung và ít nhất 1 danh mục là bắt buộc');
    }
    // -------------------------------------------------------------------

    // Verify primary category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new ValidationError('Danh mục chính không tồn tại');
    }

    // Create article (Code cũ giữ nguyên)
    const article = await Article.create({
      title,
      content,
      categoryId, // Giờ đã chắc chắn có giá trị
      authorId: req.user.id,
      thumbnailUrl: req.file?.url || null, // Nếu dùng Cloudinary/Multer
      slug: slug || undefined,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      status: status || 'draft',
      isFeatured: isFeatured === 'true' || isFeatured === true, // Fix lỗi boolean dạng string
    }, { transaction });

    // Handle multiple categories via junction table (Code cũ giữ nguyên)
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const validCategoryIds = [];
      for (const catId of categoryIds) {
        const cat = await Category.findByPk(catId);
        if (cat) validCategoryIds.push(catId);
      }
      if (validCategoryIds.length > 0) {
        await article.setCategories(validCategoryIds, { transaction });
      }
    }

    // Handle tags (Code cũ giữ nguyên)
    // ... (Phần tagIds giữ nguyên logic parse giống categoryIds nếu cần) ...
    if (tagIds) {
       let parsedTags = tagIds;
       if (typeof tagIds === 'string') {
          try { parsedTags = JSON.parse(tagIds); } catch(e) { parsedTags = [tagIds]; }
       }
       if (Array.isArray(parsedTags) && parsedTags.length > 0) {
          await article.setTags(parsedTags, { transaction });
       }
    }

    await transaction.commit();

    // Fetch full article response (Giữ nguyên)
    const fullArticle = await Article.findByPk(article.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'categories', through: { attributes: [] }, attributes: ['id', 'name', 'slug'] },
      ],
    });

    logger.info('Article created:', { articleId: article.id, title: article.title });
    successResponse(res, fullArticle, 'Article created successfully', 201);

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

  /**
   * Update article
   * PUT /api/articles/:id
   * Admin-only endpoint
   */
  async updateArticle(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        title,
        content,
        categoryId,
        categoryIds,
        tagIds,
        slug,
        metaDescription,
        metaKeywords,
        status,
        isFeatured,
      } = req.body;

      const article = await Article.findByPk(id);
      if (!article) {
        throw new NotFoundError('Article not found');
      }

      // Build updates object
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (slug !== undefined) updates.slug = slug;
      if (metaDescription !== undefined) updates.metaDescription = metaDescription;
      if (metaKeywords !== undefined) updates.metaKeywords = metaKeywords;
      if (status !== undefined) updates.status = status;
      if (isFeatured !== undefined) updates.isFeatured = isFeatured;

      if (categoryId !== undefined) {
        // Verify category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
          throw new ValidationError('Invalid categoryId - category does not exist');
        }
        updates.categoryId = categoryId;
      }

      if (req.file) updates.thumbnailUrl = req.file.url;

      await article.update(updates, { transaction });

      // Update multiple categories if provided
      if (categoryIds !== undefined) {
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
          const validCategoryIds = [];
          for (const catId of categoryIds) {
            const cat = await Category.findByPk(catId);
            if (cat) validCategoryIds.push(catId);
          }
          await article.setCategories(validCategoryIds, { transaction });
        } else {
          // Clear all categories
          await article.setCategories([], { transaction });
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          const validTagIds = [];
          for (const tagId of tagIds) {
            const tag = await Tag.findByPk(tagId);
            if (tag) validTagIds.push(tagId);
          }
          await article.setTags(validTagIds, { transaction });
        } else {
          // Clear all tags
          await article.setTags([], { transaction });
        }
      }

      await transaction.commit();

      // Fetch updated article with associations
      const updatedArticle = await Article.findByPk(id, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] },
            attributes: ['id', 'name', 'slug'],
          },
        ],
      });

      logger.info('Article updated:', {
        articleId: id,
        updates: Object.keys(updates),
      });

      successResponse(res, updatedArticle, 'Article updated successfully');
    } catch (error) {
      await transaction.rollback();
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
