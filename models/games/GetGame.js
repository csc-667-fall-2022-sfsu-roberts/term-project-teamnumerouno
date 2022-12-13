const db = require('../../db');
const GetGameModel = {};
const { getGameStatus, getPlayersInGame, getUserHand, getLastPlayed } = require('./GameHelpers');

/* Get the game's state for a given user */
GetGameModel.getGameState = (gameId, userId) => new Promise((resolve, reject) => {
    Promise.all([getGameStatus(gameId), getPlayersInGame(gameId)])
    .then(messages => {
        let gameStatus = messages[0];
        let gameUsers = messages[1];

        switch(gameStatus) {
            case "lobby":
                resolve({
                    gameId: gameId,
                    gameStatus: gameStatus,
                    gameUsers: gameUsers
                });
                break;
            case "ended":
                resolve({
                    gameId: gameId,
                    gameStatus: gameStatus
                });
                break;
            case "started":
                Promise.all([getUserHand(gameId, userId), getLastPlayed(gameId)])
                .then(messages => {
                    let userHand = messages[0];
                    let lastPlayed = messages[1];
                    resolve({
                        gameId: gameId,
                        gameStatus: gameStatus,
                        userHand: userHand,
                        lastPlayedCard: lastPlayed,
                        gameUsers: gameUsers
                    });
                }).catch(error => {
                    reject(error);
                });
                break;
            default:
                resolve("This should not happen. Something definitely wrong with game in db.");
        }
    }).catch((error) => {
        reject(error);
    })
});

module.exports = GetGameModel;