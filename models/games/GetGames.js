const db = require('../../db');
const GetGamesModel = {};

/* Obtain all non-started games */
GetGamesModel.getGames = () => new Promise ((resolve, reject) =>{
    let sqlStatement = "SELECT id, name, status, creation_time FROM games WHERE games.status = $1";
    db.any(sqlStatement, ["lobby"])
    .then((queryResults) => {
        resolve(queryResults);
    }).catch(error => {
        console.log("Couldn't get games.");
        reject(error);
    });
});

module.exports = GetGamesModel;