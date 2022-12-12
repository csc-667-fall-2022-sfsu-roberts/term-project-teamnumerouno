var express = require('express');
var router = express.Router();
const db = require('../db');

const MAX_PLAYERS = 10;
const STARTING_NUM_CARDS = 7;

// TODO Split into multiple files.

/* GET Games Listing */
router.get('/', function(req, res, next) {
  res.send('TODO');
});

/* POST a Game Listing */
router.post('/create', function(req, res, next) {

    // TODO Change to actually check for user logged in
    // TODO Use real user information
    let loggedIn = true;
    if(!loggedIn) {
        res.redirect("/");
    } else {
        // let email = req.session.email;
        // let userId = req.session.userid;
        let email = "god@mail.com";
        let userId = 1;
        let gameName = req.get("name");
        let password = req.get("password");
        let gameId;
        // Create a game.
        let sqlStatement = "INSERT INTO games (name, password, status) VALUES ($1, $2, $3) RETURNING id"; 
        db.one(sqlStatement, [gameName, password, "lobby"])
        .then( queryResult => {
            // Add user to game
            gameId = queryResult.id;
            console.log(gameId);
            let sqlStatement = "INSERT INTO game_users (user_id, game_id, is_owner, play_position, is_turn) VALUES ($1, $2, $3, $4, $5)";
            db.any(sqlStatement, [userId, gameId, true, 1, true])
            .then( queryResult => {
                console.log("Sucessfully added owner to game.");
            })
            .catch (error => {
                // Something went wrong when adding the game owner, so the game should be removed.
                let sqlStatement = "DELETE FROM games WHERE id = $1";
                db.none(sqlStatement, [gameId]).then(() => {
                    console.log("Game was removed.");
                    console.log(error);
                    res.json({error});
                });
            })
            res.json(queryResult);
        })
        .catch( error => {
            console.log(error);
            res.json({error})
        });
    }
});

/* GET game information/state */
// TODO This should get the game state from the perspective of the specified user.
// Currently giving a general game state.
router.get('/game/:gameId', function(req, res, next) {
    // TODO Change this to actually use auth and stuff.
    let userId = req.get("userId");
    let gameId = req.params.gameId;
    let sqlStatement = "SELECT * FROM game_users WHERE game_id = $1";
    db.any(sqlStatement, [gameId])
    .then(participants => {
        // Obtain game status
        let sqlStatement = "SELECT status FROM games WHERE id = $1";
        db.one(sqlStatement, [gameId])
        .then(gameStatus => {
            console.log(gameStatus.status);
            switch (gameStatus.status) {
                case "lobby":
                    res.json({
                        gameId: gameId, 
                        gameStatus: gameStatus.status, 
                        gameUsers: participants
                    });
                    break;
                case "started":
                    // Get user's hand
                    let sqlStatement = "SELECT * FROM cards WHERE id = (SELECT game_cards.card_id FROM game_cards WHERE game_cards.user_id = $1 AND game_cards.status = $2)";
                    db.any(sqlStatement, [userId, "hand"])
                    .then(userHand => {
                        // Get last played card
                        let sqlStatement = "SELECT * FROM cards WHERE id = (SELECT game_cards.card_id FROM game_cards WHERE game_cards.position = (SELECT MAX (game_cards.position) FROM game_cards) AND game_cards.status = $1)";
                        db.any(sqlStatement, ["played"])
                        .then(lastPlayedCard => {
                            res.json({
                                gameId: gameId,
                                gameStatus: gameStatus.status,
                                userHand: userHand,
                                lastPlayedCard: lastPlayedCard,
                                gameUsers: participants
                            });
                        }).catch(error => {
                            console.log(error);
                            res.json({error});
                        });
                    }).catch(error => {
                        console.log(error);
                        res.json({error});
                    });
                    break;
                case "ended":
                    res.json({gameId: gameId, gameStatus: gameStatus});
                    break;
                default:
                    console.log("Something is definitely wrong here.");
            }
        }).catch (error => {
            console.log(error);
            res.json({error});
        })
    }).catch (error => {
        console.log("Error getting game state. Or user not in game.");
        console.log(error);
        res.json({error});
    })
});

/* Join a game */
router.post('/game/:gameId/join', function(req, res, next) {

    // TODO Get userId from session.
    // For now, this is provided in the request
    let userId = req.get("userId");
    let gameId = req.params.gameId;

    let sqlStatement = "SELECT status FROM games WHERE id = $1";
    db.one(sqlStatement, [gameId])
    .then(queryResult => {
        if (queryResult.status == "started" || queryResult.status == "ended") {
            res.send("Game already started. Cannot join game.");
        } else {
            let sqlStatement = "SELECT FROM game_users WHERE game_id = $1";
            db.any(sqlStatement, [gameId])
            .then(queryResults => {
                if (queryResults.length >= MAX_PLAYERS) {
                    res.send("Max number of players reached.");
                } else {
                    let sqlStatement = "INSERT INTO game_users (user_id, game_id, is_owner, play_position, is_turn) VALUES ($1, $2, $3, $4, $5)";
                    db.any(sqlStatement, [userId, gameId, false, queryResults.length + 1, false])
                    .then( queryResults => {
                        console.log("Sucessfully added player to game.");
                        // TODO Change to a redirect to the actual game
                        res.send("Successfully added player to game.");
                    }).catch (error => {
                        console.log("User could not join game. Issue inserting into db.");
                        console.log(error);
                        res.json({error});
                    });
                }
            }).catch (error => {
                console.log("User could not join game.");
                console.log(error);
                res.json({error});
            });
        }
    }).catch (error => {
        console.log("User could not join game.");
        console.log(error);
        res.json({error});
    });
});

/* Start a game (must be owner) */
router.post('/game/:gameId/start', function(req, res, next) {
    // TODO Get the actual authenticated user id. For now its just supplied by a header.
    let userId = req.get("userId");
    let gameId = req.params.gameId;

    // Check if at least 2 players
    let sqlStatement = "SELECT * FROM game_users WHERE game_id = $1";
    db.any(sqlStatement, [gameId])
    .then( gameUsers => {
        if (gameUsers.length < 2) {
            console.log("Too few players.");
            res.send("Too few players.");
        } else {
            // Check if game owner
            let sqlStatement = "SELECT is_owner FROM game_users WHERE user_id = $1";
            db.one(sqlStatement, [userId])
            .then( queryResult => {
                if (queryResult.is_owner == false) {
                    console.log("Not game owner.");
                    res.send("Not game owner.");
                } else {
                    // Add cards to deck
                    let sqlStatement = "SELECT id FROM cards";
                    db.any(sqlStatement)
                    .then( queryResults => {
                        let cardIds = [];
                        queryResults.forEach(element => {
                            cardIds.push(element.id);
                        });
                        // Randomize card id order.
                        // CREDIT Fisher-Yates Algorithm & James Bubb
                        for (let i = cardIds.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            const temp = cardIds[i];
                            cardIds[i] = cardIds[j];
                            cardIds[j] = temp;
                        }
                        cardIds.forEach((element, i) => {
                            let sqlStatement = "INSERT INTO game_cards (game_id, card_id, status, position) VALUES ($1, $2, $3, $4)";
                            db.any(sqlStatement, [gameId, element, "deck", i + 1])
                            .then(queryResults => {
                                // Hand cards to player
                                gameUsers.forEach(element => {
                                    for (let i = 0; i < STARTING_NUM_CARDS; i++) {
                                        let sqlStatement = "UPDATE game_cards SET (game_cards.user_id, game_cards.status, game_cards.position) = ($1, $2, $3) WHERE game_cards.position = (SELECT MAX (game_cards.position) FROM game_cards)";
                                        db.any(sqlStatement, [userId, "hand", null])
                                        .then(queryResults => {
                                            // Card successfully given to user.
                                            // Set the proper game status.
                                            let sqlStatement = "UPDATE games SET status = $1 WHERE id = $2";
                                            db.any(sqlStatement, ["started", gameId])
                                            .then(queryResults => {
                                                // TODO Redirect to the game.
                                                res.send("Game sucessfully started.");
                                            }).catch(error => {
                                                console.log("Something went wrong when setting the game as started.");
                                                console.log(error);
                                                res.json({error});
                                            })
                                        }).catch(error => {
                                            console.log("Couldn't hand out cards.");
                                            console.log(error);
                                            res.json({error});
                                        })
                                    }
                                });
                            }).catch(error => {
                                console.log("Couldn't populate cards.");
                                console.log(error);
                                res.json({error});
                            })
                        });
                    })

                    // Set the proper game status
                }
            }).catch (error => {
                console.log("Couldn't start game.")
                console.log(error);
                res.json({error});
            })
        }
    }).catch (error => {
        console.log("Couldn't start game.");
        console.log(error);
        res.json({error});
    });
});

/* Do a move (must be player) */
router.post('/game/:gameId/start', function(req, res, next) {
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