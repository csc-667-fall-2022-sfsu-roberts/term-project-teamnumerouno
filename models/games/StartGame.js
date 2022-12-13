const db = require('../../db');
const StartGameModel = {};
const { getGameStatus, getPlayersInGame, checkIsGameOwner, addCardDeckToHand, addCardToDeck } = require('./GameHelpers');

const STARTING_NUM_CARDS = 7;

/* Obtain all non-started games */
StartGameModel.startGame = (userId, gameId) => new Promise ((resolve, reject) =>{

    Promise.all([getGameStatus(gameId), getPlayersInGame(gameId), checkIsGameOwner(gameId, userId)])
    .then(messages=> {
        let gameStatus = messages[0];
        let gameUsers = messages[1];
        let isOwner = messages[2];
        if (gameStatus == "started" || gameStatus == "ended") {
            resolve("Game was already started.");
        } else if (gameUsers.length < 2) {
            resolve("Not enought players.");
        } else if (!isOwner) {
            resolve("Not game owner.");
        } else {
            // Add cards to deck
            let sqlStatement = "SELECT id FROM cards";
            db.any(sqlStatement)
            .then( queryResults => {
                let cardIds = [];
                queryResults.forEach(element => {cardIds.push(element.id)});
                // Randomize card id order.
                // CREDIT Fisher-Yates Algorithm & James Bubb
                for (let i = cardIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = cardIds[i];
                    cardIds[i] = cardIds[j];
                    cardIds[j] = temp;
                }

                const deckPromises = [];
                cardIds.forEach((cardId, i) => {
                    deckPromises.push(addCardToDeck(gameId, cardId, i + 1));
                });
                Promise.all(deckPromises)
                .then(() => {
                    // const handPromises = [];
                    gameUsers.forEach(gameUser => {
                        for (let i = 0; i <STARTING_NUM_CARDS; i++) {
                            addCardDeckToHand(gameId, gameUser.user_id);
                        }
                    });
                    // Set Proper game Status
                    let sqlStatement = "UPDATE games SET status = $1 WHERE id = $2";
                    db.any(sqlStatement, ["started", gameId])
                    .then(queryResults => {
                        // TODO Redirect to game
                        resolve("Game sucessfully started.");
                    }).catch(error => {
                        console.log("Couldn't set game status. Deck population and card handouts not reverted");
                        reject(error);
                    });

                }).catch(error => {
                    console.log("Couldn't build deck.");
                    reject(error);
                });
            }).catch(error => {
                console.log("Couldn't start game.");
                reject(error);
            });
        }
    }).catch(error => {
        reject(error);
    });
});

module.exports = StartGameModel;