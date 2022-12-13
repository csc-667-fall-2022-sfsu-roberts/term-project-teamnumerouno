const db = require('../../db');
const GameHelpersModel = {};

GameHelpersModel.getGameStatus = (gameId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT status FROM games WHERE id = $1";
    db.one(sqlStatement, [gameId])
    .then((queryResult) => {
        resolve(queryResult.status);
    })
    .catch((error) => {
        console.log("Could not get game status.");
        reject(error);
    });
});

GameHelpersModel.getPlayersInGame = (gameId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT * FROM game_users WHERE game_id = $1";
    db.any(sqlStatement, [gameId])
    .then((queryResults) => {
        resolve(queryResults);
    })
    .catch((error) => {
        console.log("Could not get players in game.");
        reject(error);
    });
});

GameHelpersModel.checkPlayerIsInGame = (gameId, userId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT * FROM game_users WHERE game_id = $1 AND user_id = $2";
    db.any(sqlStatement, [gameId, userId])
    .then((queryResults) => {
        resolve(queryResults.length > 0);
    }).catch((error) => {
        console.log("Could not check for player in game.");
        reject(error);
    })
});

GameHelpersModel.checkIsGameOwner = (gameId, userId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT is_owner FROM game_users WHERE user_id = $1 AND game_id = $2";
    db.one(sqlStatement, [userId, gameId])
    .then( queryResult => {
        resolve(queryResult.is_owner);
    }).catch((error) => {
        console.log("Could not check if user is game owner.");
        reject(error);
    });
});

GameHelpersModel.getUserHand = (gameId, userId) => new Promise((resolve, reject) => {
    // TODO Optimize to be a single query.
    let sqlStatement = "SELECT card_id FROM game_cards WHERE user_id = $1 AND status = $2 AND game_id = $3";
    db.any(sqlStatement, [userId, "hand", gameId])
    .then( queryResults => {
        let sqlStatement = "SELECT * FROM cards WHERE id = $1";
        let cards = [];
        queryResults.forEach(gameCard => {
            let gameCardId = gameCard.card_id;
            db.one(sqlStatement, [gameCardId])
            .then(queryResult => {
                cards.push(queryResult);
            }).catch((error) => {
                console.log("Something went wrong when looking up card in table.")
                reject(error);
            });
        });
        resolve(cards);
    }).catch((error) => {
        console.log("Could not get the user's hand.");
        reject(error);
    });
});


GameHelpersModel.getLastPlayed = (gameId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT * FROM cards WHERE id = (SELECT game_cards.card_id FROM game_cards WHERE game_cards.position = (SELECT MAX (game_cards.position) FROM game_cards WHERE game_cards.game_id = $1 AND game_cards.status = $2))";
    db.any(sqlStatement, [gameId, "played"])
    .then( queryResults => {
        resolve(queryResults);
    }).catch((error) => {
        console.log("Couldn't get the last played card.");
        reject(error);
    });
});

GameHelpersModel.addCardToDeck = (gameId, cardId, position) => new Promise((resolve, reject) => {
    let sqlStatement = "INSERT INTO game_cards (game_id, card_id, status, position) VALUES ($1, $2, $3, $4)";
    db.any(sqlStatement, [gameId, cardId, "deck", position])
    .then( queryResult => {
        resolve("success");
    }).catch((error) => {
        console.log("Could not add a card to the deck.");
        reject(error);
    })
});

// ASSUMPTION: The user is in game. This should be verified prior.
GameHelpersModel.addCardDeckToHand = (gameId, userId) => new Promise((resolve, reject) => {
    let sqlStatement = "SELECT MAX(position) FROM game_cards WHERE game_id = $1 AND status = $2";
    db.one(sqlStatement, [gameId, "deck"])
    .then(queryResult => {
        console.log("position:")
        console.log(queryResult.max);
        let sqlStatement = "UPDATE game_cards SET user_id = $1, status = $2, position = $3 WHERE position = $5 AND game_id = $4";
        db.any(sqlStatement, [userId, "hand", null, gameId, queryResult.max])
        .then(queryResult => {
            console.log("Drawing card to hand.");
            resolve("success");
        }).catch((error) => {
            console.log("Couldn't give a card from the deck to player.");
            reject(error);
        });
    }).catch((error) => {
        console.log("Couldn't give a card from the deck to player.");
        reject(error);
    });
});
  
module.exports = GameHelpersModel;