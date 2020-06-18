var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");
var JwtStrategy = require("passport-jwt").Strategy;
var JwtExtract = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");

var config = require("./config");
const { ExtractJwt } = require("passport-jwt");

//Since we're using mongoose, it has authenticate method with the Schemas, so we don't need to explicitly add it.
//Note: If you're not using passport-local-mongoose, we have to write our own function (uname,pwd, done)=>{}
exports.local = passport.use(new LocalStrategy(User.authenticate()));

/* These 2 functions are provided bt plm for the session management to the User Schema */
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, {
    expiresIn: 3600,
  });
};

// Configuring the strategy for JSONwebtoken based strategy
var opts = {};
// This option specifies how JWT is extracted from request.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// Here we declare our middleware which will make ur
//of above options and as well as 2nd function which
//is used to verify the incoming request.
exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT Payload: ", jwt_payload);
    // after extracting the jwt payload, we will verify if the data is valid
    User.findOne({ _id: jwt_payload.sub }, (err, user) => {
      if (err) return done(err, null);
      else if (user) return done(null, user);
      else return done(null, false);
    });
  })
);

// if at any place you want to verify the user you can call this method.
exports.verifyUser = passport.authenticate("jwt", { session: false });
