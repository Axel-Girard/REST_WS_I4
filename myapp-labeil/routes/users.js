var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var configAuth = require('../config/auth');
var http=require ('http');
var querystring= require('querystring');
router.get('/', function(req, res, next) {
	res.redirect('/users/timeline');
});

/* GET users listing. */
router.get('/timeline', function(req, res, next) {
  var session = req.session;
	if(!session.user || !session.user.token){
    res.render('index');
    return;
  }

  var client = new Twitter({
    consumer_key: configAuth.twitterAuth.consumerKey,
    consumer_secret: configAuth.twitterAuth.consumerSecret,
    access_token_key: session.user.token,
    access_token_secret: session.user.tokenSecret
  });
  // get time of last week
  var date = new Date(new Date().getTime() - 60 * 60 * 24 * 500);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = (m < 10 ? "0" : "") + m;
  var d = date.getDate();
  d = (d < 10 ? "0" : "") + d;
  // receive tweets until last week
  // var params = {session:session, include_rts: false, since: y+"-"+m+"-"+d, count: 1000};
  // get the timeline of the logged in member
var get_data = querystring.stringify(session);
	var options = {
	  hostname: 'localhost',
	  port: 3000,
	  path: '/timeline',
	  method: 'GET'
	};

	var get_req = http.request(options, function(res){
		res.on('data', function(tweets){
			res.render('userTweets', { title: 'User Information', dataGet: tweets });

		});
	});

	get_req.write(get_data);
	get_req.end();

  // http.get('', params, function(error, tweets, response) {
  //   if (tweets.length <= 0) {
  // 		res.render('noTweet', { title: 'You have no tweets'});
  //   } else if (!error) {
  //     session.tweets=tweets;
  //   } else {
  //     console.log(error);
  //     res.send("Unknowed error" +error[0].code + ' ::' + error[0].message);
  //   }
  // });
});

router.get('/tweets', function(req, res, next) {
	var session = req.session;
	if(!session.user){
		res.render('index');
		return;
	}
	if(!session.user.token){
		res.render('index');
		return;
	}

	var client = new Twitter({
		consumer_key: configAuth.twitterAuth.consumerKey,
		consumer_secret: configAuth.twitterAuth.consumerSecret,
		access_token_key: session.user.token,
		access_token_secret: session.user.tokenSecret
	});

	var db = req.con;
	var qur = db.query("SELECT * FROM `twitter` WHERE `id_user` = ? ", session.profile.id,
	function (err,rows){
		if(rows.length < 1){
			res.render('noTweet', { title: 'You have no tweets'});
			return;
		}

		var waitForAllTweets=0;

		var p1 = new Promise(function (resolve, reject){
			var myTweets=[];
			for (var i = 0; i < rows.length; i++) {
				var p2 = new Promise (function (resolve, reject){
					var params = {id:rows[i].tweetID};
					client.get('statuses/show/',params, function(error, tweet, response){
						resolve(tweet);
					});
				});
				p2.then(function(tweet){
					myTweets.push(tweet);
					waitForAllTweets++;
					if(waitForAllTweets==rows.length)
					resolve(myTweets);
				})
			}
		})
		p1.then(function(myTweets){
			res.render('userSavedTweets', {title: 'Your saved Tweets',dataGet: myTweets});
		})
	});
});

router.post('/save', function(req, res, next){
	var db = req.con;
  var tweet = {
    id_user: req.session.user.twitter_id,
    tweetID: req.body.tweetID
  };
	var isSaved = false;
	db.query('SELECT * FROM twitter', function(err, rows, fields) {
		if (err) throw err;
		for (i in rows) {
			if(rows[i].id_user === tweet.id_user && rows[i].tweetID === tweet.tweetID){
				isSaved = true;
				break;
			}
		}
		if(!isSaved){
			db.query('INSERT INTO twitter set ? ', tweet , function(err,rows){
				if(err)
		      console.log(err);
			});
		}
	});
});

router.delete('/kill', function(req, res, next){
	var db = req.con;
	console.log(req.body.tweetID);
	db.query('DELETE FROM twitter WHERE tweetID= ? ', req.body.tweetID , function(err,rows){
		if(err)
		console.log('Une erreur est survenue');
      console.log(err);
	});
});
module.exports = router;
