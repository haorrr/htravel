/**
 * Itinerary Model
 * Stores AI-generated trip plans for users (Vietnamese language)
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Itinerary = sequelize.define('Itinerary', {
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
  destination: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Điểm đến không được để trống' },
      len: {
        args: [2, 255],
        msg: 'Điểm đến phải từ 2-255 ký tự',
      },
    },
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Thời gian phải ít nhất 1 ngày',
      },
      max: {
        args: [14],
        msg: 'Thời gian không được vượt quá 14 ngày',
      },
    },
  },
  budget: {
    type: DataTypes.ENUM('budget', 'moderate', 'luxury'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['budget', 'moderate', 'luxury']],
        msg: 'Ngân sách phải là một trong: budget, moderate, luxury',
      },
    },
  },
  interests: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Sở thích phải là một mảng');
        }
        if (value.length === 0) {
          throw new Error('Phải có ít nhất một sở thích');
        }
      },
    },
  },
  tripData: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      hasRequiredFields(value) {
        if (!value || typeof value !== 'object') {
          throw new Error('Dữ liệu hành trình phải là một đối tượng');
        }
        if (!Array.isArray(value.days)) {
          throw new Error('Dữ liệu hành trình phải có mảng days');
        }
        if (value.days.length === 0) {
          throw new Error('Dữ liệu hành trình phải có ít nhất một ngày');
        }
      },
    },
  },
}, {
  tableName: 'itineraries',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['destination'] },
    { fields: ['created_at'] },
  ],
});

// Instance method: Get summary for list views
Itinerary.prototype.getSummary = function () {
  return {
    id: this.id,
    destination: this.destination,
    duration: this.duration,
    budget: this.budget,
    interests: this.interests,
    createdAt: this.createdAt,
  };
};

// Instance method: Validate trip data structure
Itinerary.prototype.validateTripData = function () {
  const { days, totalEstimatedCost, tips } = this.tripData;

  if (!Array.isArray(days)) {
    throw new Error('Dữ liệu hành trình phải có mảng days');
  }

  if (days.length !== this.duration) {
    throw new Error(`Dữ liệu hành trình phải có đúng ${this.duration} ngày`);
  }

  // Validate each day has required time periods
  days.forEach((day, index) => {
    if (!day.morning || !day.afternoon || !day.evening) {
      throw new Error(`Ngày ${index + 1} thiếu thời điểm trong ngày`);
    }
  });

  return true;
};

// Instance method: Format budget display in Vietnamese
Itinerary.prototype.getBudgetDisplay = function () {
  const budgetMap = {
    budget: 'Tiết kiệm',
    moderate: 'Trung bình',
    luxury: 'Cao cấp',
  };
  return budgetMap[this.budget] || this.budget;
};

module.exports = Itinerary;
