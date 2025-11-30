/**
 * Category Model
 * Blog post categories with auto-generated slugs
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Category name cannot be empty' },
    },
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug must be lowercase alphanumeric with hyphens',
      },
    },
  },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

// Auto-generate slug from name if not provided
Category.beforeValidate((category) => {
  if (!category.slug && category.name) {
    category.slug = category.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = Category;
