var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var leaderRouter = require("./routes/leaderRouter");
var promoRouter = require("./routes/promoRouter");
var app = express();

app.use(cookieParser("12345-43434-43443"));

// Mimicking a basic Authentication functionality
auth = (req, res, next) => {
  if (!req.signedCookies.user) {
    var authHeader = req.headers.authorization;
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

    if (username == "admin" && password == "password") {
      res.cookie("user", "admin", { signed: true });
      next();
    } else {
      var err = new Error("You're not authenticated!");
      res.setHeader("WWW-Authentication", "Basic");
      err.status = 401;
      return next(err);
    }
  } else {
    if (req.signedCookies.user == "admin") {
      next();
    } else {
      var err = new Error("You're not authenticated!");
      err.status = 401;
      return next(err);
    }
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

app.use("/", indexRouter);
app.use("/users", usersRouter);
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
