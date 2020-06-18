var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const User = require("../models/users");
var passport = require("passport");
var authenticate = require("../authenticate");

// Use to to parse the incoming request body and include it in req.body
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  // register method is provided by the mongoose plugin
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        // If user doesn't exists, explicitly send back the response.
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          // Otherwise, make use of the authenticate method to send back the response
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

// if the authenticate methods fails it automatically send back a error response
// also when authenticate method is success it adds a 'user' property to the req object,
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  // create the JWT token using the logic we wrote in authenticate.js
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: "true",
    token: token,
    status: "You're succesfully logged in",
  });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    // method to remove the session from the file store
    req.session.destroy();
    // it will ask the client side to delete the cookie
    res.clearCookie();
    res.redirect("/");
  } else {
    var err = new Error("You're not logged in!");
    err.status = 403;
    return next(err);
  }
});

module.exports = router;
