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

// Category has many Articles
Category.hasMany(Article, {
  foreignKey: 'categoryId',
  onDelete: 'RESTRICT',
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
  syncModels,
};
