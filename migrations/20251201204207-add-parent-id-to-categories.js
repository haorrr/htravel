'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add parent_id column for 2-level category hierarchy
    await queryInterface.addColumn('categories', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // NULL = root category
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL', // If parent deleted, children become roots
      onUpdate: 'CASCADE',
    });

    // Add index for faster parent lookups
    await queryInterface.addIndex('categories', ['parent_id']);

    // Add description field for category details
    await queryInterface.addColumn('categories', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('categories', ['parent_id']);
    await queryInterface.removeColumn('categories', 'parent_id');
    await queryInterface.removeColumn('categories', 'description');
  },
};
