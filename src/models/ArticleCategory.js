/**
 * ArticleCategory Model
 * Junction table for many-to-many Article-Category relationship
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArticleCategory = sequelize.define('ArticleCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'articles',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'article_categories',
  timestamps: true,
  underscored: true,
  updatedAt: false, // Only createdAt needed
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'category_id'],
      name: 'article_category_unique',
    },
    { fields: ['article_id'] },
    { fields: ['category_id'] },
  ],
});

module.exports = ArticleCategory;
