const express = require("express");
const router = express.Router();
// User model
const User = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");
const passport = require("passport");

// GET signup
router.get("/signup", (req, res, next) => {
  res.render("passport/signup");
});

// POST signup
router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if( username === "" || password === "" ) {
    res.render("passport/signup", { errorMessage: "Indicate username and password"});
    return;
  }

  User.findOne({username}, "username", (err, user) => {
    if( user !== null) {
      res.render("passport/signup", { errorMessage: "The user already exists"});
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if(err) {
        res.render("passport/signup", {errorMessage: "Something went wrong"});
      } else {
        res.redirect("/");
      }
    })
  })
});

// GET login
router.get("/login", (req, res, next) => {
  res.render("passport/login");
});

// POST login
router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

module.exports = router;