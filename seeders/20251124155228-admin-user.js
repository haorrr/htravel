'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the default admin password
    const hashedPassword = await bcrypt.hash('admin123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@htravel.com',
        password: hashedPassword,
        name: 'Admin User',
        avatar_url: null,
        bio: 'System administrator',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: 'admin@htravel.com',
    });
  },
};
