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
  ],
});

module.exports = Article;
