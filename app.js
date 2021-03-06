var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var config = require("./config");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promoRouter = require("./routes/promoRouter");
var uploadRouter = require("./routes/uploadRouter");
var app = express();

// If any request is coming, check if
// it's coming on unsecured channel then redirect it to the secured server
app.all("*", (req, res, next) => {
  if (req.secure) return next();
  else
    res.redirect(
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
});
// app.use(cookieParser("12345-43434-43443"));

// Basically passport.initialize() initialises the authentication module.
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);

const mongoose = require("mongoose");
const url = config.mongoUrl;
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
app.use("/imageUpload", uploadRouter);

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
