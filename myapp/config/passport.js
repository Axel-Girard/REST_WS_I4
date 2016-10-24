var TwitterStrategy  = require('passport-twitter').Strategy;

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function(req, token, tokenSecret, profile, done) {
    var db = req.con;
    var session = req.session;
    // asynchronous
    process.nextTick(function() {
      // check if the user is already logged in
      console.log(profile);
      if (!session.user) {
        var isSaved = false;
        var user = {};
        session.user = {
          twitter_id: profile.id,
          token: token,
          displayName: profile.username,
          userName: profile.displayName,
          tokenSecret: tokenSecret
        };

        db.query('SELECT * FROM user', function(err, rows, fields) {
          if (err) throw err;
          for (i in rows) {
            if(rows[i].twitter_id === profile.id){
              isSaved = true;
              break;
            }
          }
          if(!isSaved){
            // if there is no user, create them
            user  = {
              twitter_id: profile.id,
              token: token,
              displayName: profile.username,
              userName: profile.displayName,
              tokenSecret: tokenSecret
            };
            var qur = db.query('INSERT INTO user SET ?', user);
            return done(null, user);
          }
        });
      }
      return done(null);
    });
  }));
};