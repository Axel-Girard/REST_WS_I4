var express = require('express');
var router = express.Router();
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
  //var params = {screen_name: 'universejane'};  statuses/user_timeline
  var params = {include_rts: false, count: '2000'};
  client.get('statuses/home_timeline', params, function(error, tweets, response) {
   if (tweets.length <= 0) {
    res.send("You follow nobody!");
   } else if (!error) {
     tweets.forEach(function(tweet){
       console.log(tweet.created_at);
       if(tweet.created_at >= "Sun Oct 09 16:00:00 +0000 2016"){
         tweet_text += '<div>';
         tweet_text += '<img src="'+tweet.user.profile_image_url+'" alt="'+tweet.user.id+'">';
         tweet_text += tweet.text+'<br />';
         tweet_text += tweet.user.id+'<br />';
         tweet_text += '<a href="#"><button type="button">Sauvegarder!</button></a>';
         tweet_text += '<button type="button">Supprimer</button>';
         tweet_text += '</div>';
       } else {
         tweet_text += 'older<br />';
       }
     });
     res.send(tweet_text);
   } else {
     res.send("Erreur "+process.env.TWITTER_ACCESS_TOKEN_SECRET);
   }
 });
});

module.exports = router;
