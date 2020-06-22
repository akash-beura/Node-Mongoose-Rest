var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");
var JwtStrategy = require("passport-jwt").Strategy;
var JwtExtract = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var FacebookTokenStrategy = require("passport-facebook-token");
var config = require("./config");

//Since we're using mongoose, it has authenticate method with the Schemas, so we don't need to explicitly add it.
//Note: If you're not using passport-local-mongoose, we have to write our own function (uname,pwd, done)=>{}
exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, {
    expiresIn: 3600,
  });
};

// Configuring the strategy for JSONwebtoken based strategy
var opts = {};
// This option specifies how JWT is extracted from request.
opts.jwtFromRequest = JwtExtract.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// Here we declare our middleware which will make ur
//of above options and as well as 2nd function which
//is used to verify the incoming request.
exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT Payload: ", jwt_payload);
    // after extracting the jwt payload, we will verify if the data is valid
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) return done(err, null);
      else if (user) return done(null, user);
      else return done(null, false);
    });
  })
);

// if at any place you want to verify the user you can call this method.
exports.verifyUser = passport.authenticate("jwt", { session: false });

// This method is used to ensure only admin has access to the post.
exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin == true) {
    next();
  } else {
    var err = new Error("You're unauthorized to access this resource!");
    err.status = 403;
    next(err);
  }
};

// Strategy for configuring FB login
exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err != null) {
          return done(err, false);
        }
        if (err === null && user !== undefined) {
          return done(null, user);
        } else {
          user = new User({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.familyName;
          user.save((err, user) => {
            if (err) return done(err, false);
            else return done(null, user);
          });
        }
      });
    }
  )
);
