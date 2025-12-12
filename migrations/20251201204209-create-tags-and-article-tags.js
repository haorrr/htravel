'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create tags table
    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add index for slug lookups
    await queryInterface.addIndex('tags', ['slug']);

    // Create article_tags junction table
    await queryInterface.createTable('article_tags', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Prevent duplicate article-tag pairs
    await queryInterface.addIndex('article_tags', ['article_id', 'tag_id'], {
      unique: true,
      name: 'article_tag_unique',
    });

    // Indexes for faster lookups
    await queryInterface.addIndex('article_tags', ['article_id']);
    await queryInterface.addIndex('article_tags', ['tag_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_tags');
    await queryInterface.dropTable('tags');
  },
};
