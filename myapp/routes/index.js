var express = require('express');
var passport = require('passport');
require('../config/passport')(passport); // pass passport for configuration
var session = require('express-session');
var router = express.Router();

// required for passport
router.use(session({
    secret: 'xXdarkkikouXx', // session secret
    resave: true,
    saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions

/* GET home page. */
router.get('/', function(req, res, next) {
  var session = req.session;
  if(session.user !== undefined && session.user.token !== undefined){
    res.redirect('/twitter');
    return;
  }

  res.render('index', { title: 'Corvus' });
});

router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect : '/twitter',
  failureRedirect : '/'
}));

router.get('/profile', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(req.session.tweets));
});

module.exports = router;
