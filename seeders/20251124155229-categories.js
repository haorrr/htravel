'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Adventure Travel',
        slug: 'adventure-travel',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Cultural Tours',
        slug: 'cultural-tours',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Beach Destinations',
        slug: 'beach-destinations',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Food & Cuisine',
        slug: 'food-cuisine',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Travel Tips',
        slug: 'travel-tips',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Budget Travel',
        slug: 'budget-travel',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
