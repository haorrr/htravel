/**
 * VirtualTrip Model
 * AI-generated travel photos (original + generated image)
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VirtualTrip = sequelize.define('VirtualTrip', {
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
  originalImageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  generatedImageUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  destinationName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Destination name cannot be empty' },
    },
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Generation metadata (model, prompt, timestamp, cost, etc.)',
  },
}, {
  tableName: 'virtual_trips',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
  ],
});

module.exports = VirtualTrip;
