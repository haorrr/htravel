'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add SEO fields
    await queryInterface.addColumn('articles', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: true, // Will be generated from title
      unique: true,
    });

    await queryInterface.addColumn('articles', 'meta_description', {
      type: Sequelize.STRING(160), // SEO best practice: 150-160 chars
      allowNull: true,
    });

    await queryInterface.addColumn('articles', 'meta_keywords', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // Add publishing features
    await queryInterface.addColumn('articles', 'is_featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('articles', 'status', {
      type: Sequelize.ENUM('draft', 'published'),
      defaultValue: 'draft',
      allowNull: false,
    });

    await queryInterface.addColumn('articles', 'published_at', {
      type: Sequelize.DATE,
      allowNull: true, // NULL until published
    });

    // Add view counter
    await queryInterface.addColumn('articles', 'view_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    // Add indexes for common queries
    await queryInterface.addIndex('articles', ['slug']);
    await queryInterface.addIndex('articles', ['status']);
    await queryInterface.addIndex('articles', ['is_featured']);
    await queryInterface.addIndex('articles', ['published_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('articles', ['slug']);
    await queryInterface.removeIndex('articles', ['status']);
    await queryInterface.removeIndex('articles', ['is_featured']);
    await queryInterface.removeIndex('articles', ['published_at']);

    await queryInterface.removeColumn('articles', 'slug');
    await queryInterface.removeColumn('articles', 'meta_description');
    await queryInterface.removeColumn('articles', 'meta_keywords');
    await queryInterface.removeColumn('articles', 'is_featured');
    await queryInterface.removeColumn('articles', 'status');
    await queryInterface.removeColumn('articles', 'published_at');
    await queryInterface.removeColumn('articles', 'view_count');
  },
};
