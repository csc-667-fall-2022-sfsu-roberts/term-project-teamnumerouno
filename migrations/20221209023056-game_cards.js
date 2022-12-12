'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('game_cards', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
      card_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cards',
          key: 'id'
        },
        unique: false,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        unique: false
      },
      status: {
        type: Sequelize.ENUM(
          "deck",
          "played",
          "hand"
        ),
        defaultValue: "deck"
      },
      position: {
        type: Sequelize.INTEGER
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('game_cards');
  }
};
