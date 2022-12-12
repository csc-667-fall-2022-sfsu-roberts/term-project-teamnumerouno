'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cards', { 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      color: {
        type: Sequelize.ENUM(
          "red",
          "yellow",
          "blue",
          "green"),
        allowNull: true
      },
      value: {
        type: Sequelize.ENUM(
          "0", "1", "2", "3", "4", "5", "6",
          "7", "8", "9", 
          "draw2", "reverse", "skip",
          "wild", "wild4"
        ),
        allowNull: false
      }
    }).then(() => {
      // Populating Cards
      let colors = ["red", "yellow", "blue", "green"];
      let types = ["0", "1", "2", "3", "4", "5", "6", 
        "7", "8", "9", "draw2", "reverse", "skip",];
      let cardsToInsert = [];
      function createCards(cardsToInsert) {
        // Main Cards
        colors.forEach(cardColor => {
          types.forEach(cardType => {
            cardsToInsert.push({
              color: cardColor,
              value: cardType
            });
          });
        });
        // Wildcards
        cardsToInsert.push({value: "wild"});
        cardsToInsert.push({value: "wild"});
        cardsToInsert.push({value: "wild4"});
        cardsToInsert.push({value: "wild4"});
        return;
      }

      // Populate twice for a standard sized deck.
      createCards(cardsToInsert);
      createCards(cardsToInsert);
      return queryInterface.bulkInsert('cards', (cardsToInsert));
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('cards');
  }
};
