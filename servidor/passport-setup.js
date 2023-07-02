const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  //console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //User.findById(id, function(err, user) {
    done(null, user);
  //});
});

passport.use(new GoogleStrategy({
    clientID:"24145474530-8vpbhdadi0bi29am764a50bpjpun3rlc.apps.googleusercontent.com",
    clientSecret:"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",
    callbackURL:"https://localhost:3000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(null, profile);
    //});
  }
));
