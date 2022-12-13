const db = require('../../db');
const { getGameStatus, getPlayersInGame, checkPlayerIsInGame } = require('./GameHelpers');
const JoinGameModel = {};

// TODO Make some sort of global variable
const MAX_PLAYERS = 10;

JoinGameModel.joinGame = (userId, gameId) => new Promise ((resolve, reject) => {
    Promise.all([getGameStatus(gameId), getPlayersInGame(gameId), checkPlayerIsInGame(gameId, userId)])
    .then(messages => {
        let gameStatus = messages[0];
        let gameUsers = messages[1];
        let playerIsInGame = messages[2];
        if (gameStatus == "started" || gameStatus == "ended") {
            return resolve("Game already started. Cannot join game.");
        } else if (gameUsers.length >= MAX_PLAYERS) {
            return resolve("Max number of players reached.");
        } else if (playerIsInGame) {
            return resolve("Player is already in game.");
        } else {
            let sqlStatement = "INSERT INTO game_users (user_id, game_id, is_owner, play_position, is_turn) VALUES ($1, $2, $3, $4, $5)";
                db.any(sqlStatement, [userId, gameId, false, gameUsers.length + 1, false])
                .then( queryResults => {
                    // TODO Change to a redirect to the actual game
                    return resolve("Successfully added player to game.");
                }).catch (error => {
                    console.log("User could not join game. Issue inserting into db.");
                    return reject(error);
                });
        }
    }).catch (error => {
        console.log("User could not join game.");
        return reject(error);
    });
  });
  
  module.exports = JoinGameModel;