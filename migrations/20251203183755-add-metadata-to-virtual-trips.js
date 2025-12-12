/**
 * Migration: Add metadata column to virtual_trips table
 * Purpose: Store generation metadata (model, prompt, timestamp, cost, etc.)
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('virtual_trips', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Generation metadata (model, prompt, timestamp, cost, etc.)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('virtual_trips', 'metadata');
  }
};
