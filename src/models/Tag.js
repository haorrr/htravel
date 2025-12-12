/**
 * Tag Model
 * Tags for article organization and discovery
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Tag name cannot be empty' },
      len: {
        args: [2, 50],
        msg: 'Tag name must be 2-50 characters',
      },
    },
  },
  slug: {
    type: DataTypes.STRING(50),
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
  tableName: 'tags',
  timestamps: true,
  underscored: true,
});

// Auto-generate slug from name if not provided
Tag.beforeValidate((tag) => {
  if (!tag.slug && tag.name) {
    tag.slug = tag.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = Tag;
