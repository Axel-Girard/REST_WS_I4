var express = require('express');
var router = express.Router();
var util = require("util");
var fs = require("fs");
var path = require('path');
var url = require('url');
var colors = require('colors');
var Twitter = require('twitter');



// load the auth variables
var configAuth = require('../config/auth');
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callback: configAuth.twitterAuth.callbackURL
});

var tweet_text = "";

/* GET users listing. */
router.get('/', function(req, res, next) {
  var session = req.session;
  var p1 = new Promise(
    function(resolve, reject) {
      twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
        if (error) {
          console.log("Error getting OAuth request token : " + error);
          reject("Err");
        } else {
          session.requestToken = requestToken;
          session.requestTokenSecret = requestTokenSecret;
          resolve(session);
        }
      })
    }
  );

  p1.then(function(valeur) {
    session.requestToken = valeur.requestToken;
    session.requestTokenSecret = valeur.requestTokenSecret;


    var p2 = new Promise(
      function(resolve, reject) {
        twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
          if (error) {
            console.log(error);
          } else {
            //store accessToken and accessTokenSecret somewhere (associated to the user)
            //Step 4: Verify Credentials belongs here
            session.accessToken = accessToken;
            session.accessTokenSecret = accessTokenSecret;
            resolve(session);
          }
        })
      }
    );

    p2.then(function(valeur) {
      session.accessToken = valeur.accessToken;
      session.accessTokenSecret = valeur.accessTokenSecret;
      console.log(valeur); // Succes!
    }, function(raison) {
      console.log(raison); // Error!
      res.sendStatus(400);
    });



    console.log(valeur); // Succes!
    res.sendStatus(200);
  }, function(raison) {
    console.log(raison); // Error!
    res.sendStatus(400);
  });
});

router.get('/hw', function(req, res, next) {
  var session = req.session;
  console.log(session.requestToken);
  if(session.requestToken){
    twitter.statuses("update", {
      status: "Hello world!"
    },
    session.user.token,
    session.user.tokenSecret,
    function(error, data, res) {
      if (error) {
        console.error(error);
      } else {
        console.log("Ça marche, bichette !");
        res.sendStatus(200);
      }
    });
  } else {
    console.log("Y'a rien...");
  }
  res.send("204");
});

/* GET users listing. */
router.get('/tweets', function(req, res, next) {
  var session = req.session;
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
  		res.render('userTweets', { title: 'User Information', dataGet: tweets });
    } else {
      res.send("Unknowed error" + error);
    }
  });
});

module.exports = router;
