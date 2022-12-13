var express = require('express');
var router = express.Router();
const db = require('../db');

const { joinGame } = require('../models/games/JoinGame');
const { createGame } = require('../models/games/CreateGame');
const { getGames } = require('../models/games/GetGames');
const { startGame } = require('../models/games/StartGame');
const { getGameState } = require('../models/games/GetGame');

/* GET Games Listing */
router.get('/', function(req, res, next) {
    getGames().then((response) => {
        res.json({response});
    }).catch(error => {
        console.log(error);
        res.json({error});
    });
});

/* POST a Game Listing */
router.post('/create', function(req, res, next) {
    let userId = req.get("userId");
    let gameName = req.get("name");
    let gamePassword = req.get("password");

    createGame(userId, gameName, gamePassword)
    .then((response) => {
        // TODO Change to a redirect to the game's page.
        res.json({response});
    }).catch(error => {
        console.log(error);
        res.json({error});
    }); 
});

/* GET game information/state */
router.get('/game/:gameId', function(req, res, next) {
    // TODO Change this to actually use auth and stuff.
    let userId = req.get("userId");
    let gameId = req.params.gameId;

    getGameState(gameId, userId)
    .then((response) => {
        res.json({response});
    }).catch(error => {
        console.log(error);
        res.json({error});
    })
});

/* Join a game */
router.post('/game/:gameId/join', function(req, res, next) {
    // TODO Get the actual authenticated user id. For now its just supplied by a header.
    let userId = req.get("userId");
    let gameId = req.params.gameId;

    joinGame(userId, gameId)
    .then((response) => {
        res.json({response});
    }).catch(error => {
        console.log(error);
        res.json({error});
    })
});

/* Start a game (must be owner) */
router.post('/game/:gameId/start', function(req, res, next) {
    // TODO Get the actual authenticated user id. For now its just supplied by a header.
    let userId = req.get("userId");
    let gameId = req.params.gameId;

    startGame(userId, gameId)
    .then((response) => {
        res.json({response});
    }).catch(error => {
        console.log(error);
        res.json({error});
    })
});

/* Do a move (must be player) */
router.post('/game/:gameId/move', function(req, res, next) {
    switch (req.get("move")) {
        case "play-card":
            // Check is player turn
            // Check is valid move
            // Update game state
            // Update next user's info (set turn & cards to draw)
            break;
        case "draw-card":
            break;
        case "end-turn":
            // Check proper number of cards drawn
            break;
        default:
            res.send("TODO");
    }
    res.send("TODO");
});

// TODO Note to myself, I'm going to need some middleware that always checks for the win condition.

module.exports = router;