/**
 * Model Registry & Associations
 * Centralizes model imports and defines relationships
 */

const sequelize = require('../config/database');
const User = require('./User');
const CheckIn = require('./CheckIn');
const Category = require('./Category');
const Article = require('./Article');
const VirtualTrip = require('./VirtualTrip');
const Itinerary = require('./Itinerary');
const Tag = require('./Tag');
const ArticleCategory = require('./ArticleCategory');
const ArticleTag = require('./ArticleTag');

// ===================
// Model Associations
// ===================

// User has many relationships
User.hasMany(CheckIn, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  as: 'checkIns',
});

User.hasMany(Article, {
  foreignKey: 'authorId',
  onDelete: 'SET NULL',
  as: 'articles',
});

User.hasMany(VirtualTrip, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  as: 'virtualTrips',
});

User.hasMany(Itinerary, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  as: 'itineraries',
});

// Category self-referencing (parent-child)
Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'children',
  onDelete: 'SET NULL',
});

Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parent',
});

// Category has many Articles (legacy single category - keeping for backward compatibility)
Category.hasMany(Article, {
  foreignKey: 'categoryId',
  onDelete: 'RESTRICT',
  as: 'articles',
});

// Article-Category many-to-many (via ArticleCategory junction)
Article.belongsToMany(Category, {
  through: ArticleCategory,
  foreignKey: 'articleId',
  otherKey: 'categoryId',
  as: 'categories',
});

Category.belongsToMany(Article, {
  through: ArticleCategory,
  foreignKey: 'categoryId',
  otherKey: 'articleId',
  as: 'categoryArticles',
});

// Article-Tag many-to-many (via ArticleTag junction)
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'articleId',
  otherKey: 'tagId',
  as: 'tags',
});

Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tagId',
  otherKey: 'articleId',
  as: 'articles',
});

// Inverse associations (belongs to)
CheckIn.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Article.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

Article.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

VirtualTrip.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Itinerary.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// ===================
// Sync Models
// ===================

/**
 * Synchronize models with database
 * WARNING: Only use in development with { alter: true }
 * In production, always use migrations
 */
const syncModels = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Models synchronized with database');
    } catch (error) {
      console.error('❌ Model sync failed:', error);
      throw error;
    }
  }
};

// ===================
// Exports
// ===================

module.exports = {
  sequelize,
  User,
  CheckIn,
  Category,
  Article,
  VirtualTrip,
  Itinerary,
  Tag,
  ArticleCategory,
  ArticleTag,
  syncModels,
};
