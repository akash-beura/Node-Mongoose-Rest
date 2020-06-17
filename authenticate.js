var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");
const { serializeUser } = require("passport");

//Since we're using mongoose, it has authenticate method with the Schemas, so we don't need to explicitly add it.
//Note: If you're not using passport-local-mongoose, we have to write our own function (uname,pwd, done)=>{}
exports.local = passport.use(new LocalStrategy(User.authenticate()));

/* These 2 functions are provided bt plm for the session management to the User Schema */
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);
