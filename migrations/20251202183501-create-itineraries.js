'use strict';

/**
 * Migration: Create Itineraries Table
 * AI Smart Trip Planner - stores user's generated travel itineraries
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('itineraries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who owns this itinerary',
      },
      destination: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Trip destination (e.g., "Tokyo, Japan")',
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Number of days (1-14)',
      },
      budget: {
        type: Sequelize.ENUM('budget', 'moderate', 'luxury'),
        allowNull: false,
        comment: 'Budget level for the trip',
      },
      interests: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of interest keywords (e.g., ["culture", "food", "nature"])',
      },
      trip_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Full itinerary structure with days, activities, costs, tips (Vietnamese language)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for query performance
    await queryInterface.addIndex('itineraries', ['user_id'], {
      name: 'idx_itineraries_user_id',
    });

    await queryInterface.addIndex('itineraries', ['created_at'], {
      name: 'idx_itineraries_created_at',
    });

    await queryInterface.addIndex('itineraries', ['destination'], {
      name: 'idx_itineraries_destination',
    });

    console.log('✅ Itineraries table created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('itineraries');
    console.log('✅ Itineraries table dropped');
  },
};
