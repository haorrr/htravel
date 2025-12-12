/**
 * ArticleTag Model
 * Junction table for many-to-many Article-Tag relationship
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArticleTag = sequelize.define('ArticleTag', {
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
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tags',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'article_tags',
  timestamps: true,
  underscored: true,
  updatedAt: false, // Only createdAt needed
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'tag_id'],
      name: 'article_tag_unique',
    },
    { fields: ['article_id'] },
    { fields: ['tag_id'] },
  ],
});

module.exports = ArticleTag;
