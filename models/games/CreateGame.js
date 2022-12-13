const db = require('../../db');
const CreateGameModel = {};

// TODO Make some sort of global variable
const MAX_PLAYERS = 10;

/* Given the userId, desired game name and desired game password, create a new game, set the user as
the admin and obtain the created game's id. */
CreateGameModel.createGame = (userId, gameName, gamePassword) => new Promise ((resolve, reject) => {
    let sqlStatement = "INSERT INTO games (name, password, status) VALUES ($1, $2, $3) RETURNING id"; 
    db.one(sqlStatement, [gameName, gamePassword, "lobby"])
    .then( queryResult => {
        // Add admin to game
        gameId = queryResult.id;
        console.log(gameId);
        let sqlStatement = "INSERT INTO game_users (user_id, game_id, is_owner, play_position, is_turn) VALUES ($1, $2, $3, $4, $5)";
        db.any(sqlStatement, [userId, gameId, true, 1, true])
        .then(queryResult => {
            console.log("Sucessfully added owner to game.");
            resolve(gameId);
        }).catch( error => {
            // Something went wrong when adding the game admin, so the game should be removed.
            let sqlStatement = "DELETE FROM games WHERE id = $1";
            db.none(sqlStatement, [gameId]).then(() => {
                console.log("Game was removed, because owner couldn't be added.");
                reject(error);
            }).catch( error => {
                console.log("Yeah something is very wrong....");
                reject(error);
            })
        })
    }).catch(error => {
        console.log("Something went wrong when creating the game.");
        reject(error);
    });
});
  
  module.exports = CreateGameModel;