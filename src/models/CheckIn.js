/**
 * CheckIn Model
 * Tracks user check-ins at locations with coordinates
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CheckIn = sequelize.define('CheckIn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  locationName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Location name cannot be empty' },
    },
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: { args: [-90], msg: 'Latitude must be >= -90' },
      max: { args: [90], msg: 'Latitude must be <= 90' },
    },
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: { args: [-180], msg: 'Longitude must be >= -180' },
      max: { args: [180], msg: 'Longitude must be <= 180' },
    },
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Invalid date format' },
    },
  },
}, {
  tableName: 'check_ins',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['visit_date'] },
  ],
});

module.exports = CheckIn;
