var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promoRouter = require("./routes/promoRouter");
var app = express();

// app.use(cookieParser("12345-43434-43443"));

// We're making use of session and session-store, after using this the session object can be found on req.session
app.use(
  session({
    name: "session-id",
    secret: "12345-2345-33232-23223",
    saveUninitialized: false,
    store: new FileStore(),
  })
);
// Basically passport.initialize() initialises the authentication module.
app.use(passport.initialize());
// After the login method is called and we got the user object in req, this below call will ensure serialization of the user info & sthen store it in the session
// If the session cookie is already in req, it will proceed accrodingly.
app.use(passport.session());

// these 2 routes should be above since it doesn't requires authorization
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Mimicking a basic Authentication functionality
auth = (req, res, next) => {
  // Check if user isn't authenticated
  if (!req.user) {
    var err = new Error("You're not authenticated!");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
};

app.use(auth);

const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);

// This is to connect with the mongoDB server via mongoose.
connect.then(
  (db) => {
    console.log("Connected to mongod server..");
  },
  (err) => {
    console.log(err);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
