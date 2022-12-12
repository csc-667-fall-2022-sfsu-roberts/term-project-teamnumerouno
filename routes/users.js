var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('user/register');
});

/* Create an Account */
// TODO This is temporary. The user can specify whatever 
// information they want without consequence. Change asap.
router.post('/register', function(req, res, next) {
  let email = req.get("email");
  let password = req.get("password");

  let sqlStatement = "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id;"
  db.one(sqlStatement, [email, password]).then(queryResult => {
    let userId = queryResult.id;
    res.send(`Created a user with the id: ${userId}`);
  }).catch(error => {
    console.log("Something went wrong when creating a user.");
    console.log(error);
    res.json({error});
  })
})

module.exports = router;
