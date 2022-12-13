'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      }
    })
    await queryInterface.bulkInsert('users', [
      {
        email: 'god@mail.com',
        password: 'password'
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
