'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('game_users', { 
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        unique: false,
        allowNull: false
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'games',
          key: 'id'
        },
        unique: false,
        allowNull: false
      },
      is_owner: {
        type: Sequelize.BOOLEAN
      },
      play_position: {
        type: Sequelize.INTEGER
      },
      is_turn: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      to_draw: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('game_users');
  }
};
