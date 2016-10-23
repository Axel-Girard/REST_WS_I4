var express = require('express');
var router = express.Router();
var util = require("util");
var fs = require("fs");
var path = require('path');
var url = require('url');
var colors = require('colors');
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var tweet_text = "";

/* GET users listing. */
router.get('/', function(req, res, next) {
     res.sendFile(path.resolve('views/sign-in.html'));
});

/* GET users listing. */
router.get('/tweets', function(req, res, next) {
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
  		res.render('userTweets', { title: 'User Information', dataGet: tweets });
    } else {
      res.send("Unknowed error");
    }
  });
});

module.exports = router;
