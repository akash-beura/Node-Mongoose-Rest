var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const Users = require("../models/users");

// Use to to parse the incoming request body and include it in req.body
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user != null) {
        var err = new Error("User already exists!");
        err.status = 403;
        next(err);
      } else {
        Users.create(req.body).then(
          (user) => {
            console.log("User registered.");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ status: "registration successful" });
          },
          (err) => console.log(err)
        );
      }
    })
    .catch((error) => console.log(error));
});

router.post("/login", (req, res, next) => {
  // If the sesssion doesn't exist
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    // Check if the auth header exists, if no, throw error
    if (!authHeader) {
      var err = new Error("You're not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }
    // We get the base64 encoded value as string, decode it as base64 string then decode it where we will get username:password as result
    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var username = auth[0];
    var password = auth[1];

    // First check if the user exists or not
    Users.findOne({ username: username })
      .then((user) => {
        // If user doesn't exist, throw back error.
        if (user == null) {
          var err = new Error("You're not authenticated!");
          err.status = 403;
          return next(err);
        } else {
          // If password is correct
          if (user.password == password) {
            req.session.user = "authenticated";
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("You're authenticated");
            next();
          } else {
            // IF PASSWORD IS WRONG, SHOW APPROPRIATE ERROR
            var err = new Error("You're not authenticated!");
            err.status = 403;
            return next(err);
          }
        }
      })
      .catch((err) => console.log(err));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You're already authenticated.");
  }
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
