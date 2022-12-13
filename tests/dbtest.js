const express = require("express");
const router = express.Router();
const db = require('../db');

router.get("/", (request, response) => {
    db.any(`INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`)
    .then( _ => db.any(`SELECT * FROM test_table`))
    .then( results => response.json(results))
    .catch( error => {
        console.log(error);
        response.json({error})
    });
});

router.get("/cards", (request, response) => {
    db.any(`SELECT * FROM cards`)
    .then( results => response.json(results))
    .catch( error => {
        console.log(error);
        response.json({error})
    });
});

router.get("/users", (request, response) => {
    db.any(`SELECT id, email FROM users`)
    .then( results => response.json(results))
    .catch( error => {
        console.log(error);
        response.json({error})
    });
});

router.get("/deckCards/:gameId", (request, response) => {
    let gameId = request.params.gameId;
    db.any(`SELECT * FROM game_cards WHERE game_id = ${gameId} AND status = 'deck'`)
    .then(results => response.json(results))
    .catch(error => {
        response.json({error});
    });
});

router.get("/userHand/:userId/:gameId", (request, response) => {
    let userId = request.params.userId;
    let gameId = request.params.gameId;
    db.any(`SELECT * FROM game_cards WHERE game_id = ${gameId} AND user_id = ${userId}`)
    .then(results => response.json(results))
    .catch(error => {
        response.json({error});
    });
})

module.exports = router;