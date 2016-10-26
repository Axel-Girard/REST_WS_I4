var express = require('express');
var passport = require('passport');
require('../config/passport')(passport);
var session = require('express-session');
var router = express.Router();

// required for passport
router.use(session({
    secret: 'xXdarkkikouXx',
    resave: true,
    saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session());

/* GET home page. */
router.get('/', function(req, res, next) {
  var session = req.session;
  if(session.user !== undefined && session.user.token !== undefined){
    res.redirect('/users/timeline');
    return;
  }

  res.render('index');
});

router.get('/auth/twitter', passport.authenticate('twitter', {
  scope : 'email'
}));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect : '/users/timeline',
  failureRedirect : '/'
}));

module.exports = router;
