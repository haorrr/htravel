/**
 * Article Model
 * Blog posts with author and category relationships
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title cannot be empty' },
      len: {
        args: [5, 255],
        msg: 'Title must be 5-255 characters',
      },
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Content cannot be empty' },
      len: {
        args: [50, 50000],
        msg: 'Content must be 50-50000 characters',
      },
    },
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug must be lowercase alphanumeric with hyphens',
      },
    },
  },
  metaDescription: {
    type: DataTypes.STRING(160),
    allowNull: true,
    validate: {
      len: {
        args: [0, 160],
        msg: 'Meta description must be 160 characters or less',
      },
    },
  },
  metaKeywords: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
    allowNull: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true, // Allow NULL if author deleted
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
}, {
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['author_id'] },
    { fields: ['category_id'] },
    { fields: ['created_at'] },
    { fields: ['slug'] },
    { fields: ['status'] },
    { fields: ['is_featured'] },
    { fields: ['published_at'] },
  ],
});

// Auto-generate slug from title if not provided
Article.beforeValidate((article) => {
  if (!article.slug && article.title) {
    article.slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Set publishedAt when status changes to published
  if (article.status === 'published' && !article.publishedAt) {
    article.publishedAt = new Date();
  }
});

module.exports = Article;
