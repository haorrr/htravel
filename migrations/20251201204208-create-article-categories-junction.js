'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create junction table for many-to-many article-category relationship
    await queryInterface.createTable('article_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      article_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id',
        },
        onDelete: 'CASCADE', // Delete junction when article deleted
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE', // Delete junction when category deleted
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Prevent duplicate article-category pairs
    await queryInterface.addIndex('article_categories', ['article_id', 'category_id'], {
      unique: true,
      name: 'article_category_unique',
    });

    // Indexes for faster lookups
    await queryInterface.addIndex('article_categories', ['article_id']);
    await queryInterface.addIndex('article_categories', ['category_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_categories');
  },
};
