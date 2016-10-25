var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var configAuth = require('../config/auth');

var tweet_text = "";

/* GET users listing. */
router.get('/', function(req, res, next) {
  var session = req.session;
  if(!session.user){
    res.render('index', { title: 'Corvus'});
    return;
  }
  if(!session.user.token){
    res.render('index', { title: 'Corvus'});
    return;
  }

  var client = new Twitter({
    consumer_key: configAuth.twitterAuth.consumerKey,
    consumer_secret: configAuth.twitterAuth.consumerSecret,
    access_token_key: session.user.token,
    access_token_secret: session.user.tokenSecret
  });
  // get time of last week
  var date = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = (m < 10 ? "0" : "") + m;
  var d = date.getDate();
  d = (d < 10 ? "0" : "") + d;
  // receive tweets until last week
  var params = {include_rts: false, since: y+"-"+m+"-"+d};
  // get the timeline of the logged in member
  client.get('statuses/home_timeline', params, function(error, tweets, response) {
    if (tweets.length <= 0) {
  		res.render('noTweet', { title: 'You have no tweets'});
    } else if (!error) {
      session.tweets=tweets;
  		res.render('userTweets', { title: 'User Information', dataGet: tweets });
    } else {
      res.send("Unknowed error" + error);
    }
  });
});

router.post('/save', function(req, res, next){
	var db = req.con;
  var tweet = {
    id_user: req.session.user.twitter_id,
    tweetID: req.body.tweetID
  };
  console.log("A faire: verifier que le tweet n'est pas deja enregistre");
	var qur = db.query('INSERT INTO twitter set ? ', tweet , function(err,rows){
		if(err)
      console.log(err);
		res.redirect('/twitter');
	});
});

module.exports = router;
