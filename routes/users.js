var express = require('express');
var router = express.Router();
const db = require('../db');

var express = require("express");
// const req = require("express/lib/request");
var router = express.Router();
var bcrypt = require("bcrypt");
// const { mapOptionFieldNames } = require('sequelize/types/utils');
const { response, request } = require('express');
//const url = require('url');

//TODO - use this users.js route as a guide for other routes to
//      access specific data, and submit other data to database.
/* GET users listing. */
const handleLogin =
  (request, response) =>
  ({ id, username }) => {
    request.session.authenticated = true;
    request.session.userId = id;
    request.session.username = username;

    response.redirect("/lobby");
  };
  const handleLoginError = (response, redirectUri) => (error) => {
    console.log({ error });
    response.redirect(redirectUri);
  };

router.post("/login",(req,res)=>{
  const {username,password} = request.body;

  Users.login({username, password})
  .then(handleLogin(req, res))
  .catch(handleLoginError(res, "/auth.login"));
});
router.post("/register", (req, res, next) => {
  
    const { username, password,email } = request.body;
    // let confirmPassword = req.body.confirmPassword;
  
      Users.register({ username, email, password })
        .then(handleLogin(request, response))
        .catch(handleLoginError(response, '/auth/register'));
    });
// db.execute()
router.get("/login",function(req,res,next){
  response.render("public/login", {title: 'Login page'})
});

router.get("/logout", function(req,res,next){
  req.session.destroy((err)=>{
    if(err){
      console.log({err});
      next(err);
    }
req.redirect("/user/login");
  })
  
});

router.get('/register', function(req, res, next) {
  res.render('user/register');
});

/* Create an Account */
// TODO This is temporary. The user can specify whatever 
// information they want without consequence. Change asap.
router.post('/registertemp', function(req, res, next) {
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
