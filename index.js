var express = require('express');
var app = express();
var Twitter = require('twitter');
var colors = require('colors');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRE
});

app.get('/', function (req, res) {
  //var params = {screen_name: 'universejane'};  statuses/user_timeline
  var params = {include_rts: false, count: '20'};
  client.get('statuses/home_timeline', params, function(error, tweets, response) {
    if (tweets.length <= 0) {
     res.send("You follow nobody!");
    } else if (!error) {
      var tweet_text = "";
      tweets.forEach(function(tweet){
        tweet_text += '<div>';
        tweet_text += '<img src="'+tweet.user.profile_image_url+'" alt="'+tweet.user.id+'">';
        tweet_text += tweet.text+'<br />';
        tweet_text += tweet.user.id+'<br />';
        tweet_text += '<a href="#"><button type="button">Sauvegarder!</button></a>';
        tweet_text += '<button type="button">Supprimer</button>';
        tweet_text += '</div>';
      });
      res.send(tweet_text);
    } else {
      res.send("Erreur");
    }
  });
});

app.listen(3000, function () {
  console.log('App listening on port 3000!'.rainbow.bgWhite);
});
