var express = require('express');
var router = express.Router();
var util = require("util");
var fs = require("fs");
var path = require('path');
var url = require('url');
var Twitter = require('twitter');
var configAuth = require('../config/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
	var db = req.con;
	var data = "";
	db.query('SELECT * FROM user',function(err,rows){
		//if(err) throw err;

		// console.log('Data received from Db:\n');
		console.log(rows);
		var data = rows;
		console.log("Outside--"+data.id);
		res.render('userIndex', { title: 'User Information', dataGet: data });
	});
});

router.get('/index', function(req, res, next) {
	var db = req.con;
	var data = "";
	db.query('SELECT * FROM user',function(err,rows){
		//if(err) throw err;

		// console.log('Data received from Db:\n');
		console.log(rows);
		var data = rows;
		console.log("Outside--"+data.id);
		res.render('userIndex', { title: 'User Information', dataGet: data });
	});
});

router.get('/add', function(req, res, next) {
	res.render('userAdd', { title: 'Add User', btname: 'Add user'});
});

router.get('/update/:id', function(req, res, next) {
	var db = req.con;
	db.query('SELECT * FROM user WHERE id = ? ',[req.params.id] ,function(err,rows){
		if(err){
			res.send(JSON.stringify({'status': 0, 'msg': 'Error User deleted', 'raw': JSON.stringify(req.params)}));
		}
		res.render('updateUser', { title: 'Update User', data: rows});
	});
});

router.put('/update', function(req, res, next) {
	console.log("---"+JSON.stringify(req.body));
	var db = req.con;
	var data = {
			name: req.body.name,
			email: req.body.email
		}
	db.query('UPDATE user set ? WHERE id = ?',[data, req.body.id] ,function(err,rows){
		if(err){
			res.send(JSON.stringify({'status': 0, 'msg': 'Error updating user', 'raw': JSON.stringify(req.body)}));
		}
		res.send(JSON.stringify({'status': 1, 'msg': 'User updated', 'raw': JSON.stringify(req.body)}));
	});
});

router.delete('/delete/:id', function(req, res) {
	//var url_parts = url.parse(req.url, true); // Read parameter from url if any
	//console.log("---"+JSON.stringify(url_parts.query));
	console.log("---"+JSON.stringify(req.params));
	var db = req.con;
	db.query('DELETE FROM user WHERE id = ? ',[req.params.id] ,function(err,rows){
		if(err){
			res.send(JSON.stringify({'status': 0, 'msg': 'Error User deleted', 'raw': JSON.stringify(req.params)}));
		}
		res.send(JSON.stringify({'status': 1, 'msg': 'User deleted', 'raw': JSON.stringify(req.params)}));
	});
});

router.post('/addUser', function(req, res, next) {
	var db = req.con;
	console.log("FormData "+ JSON.stringify(req.body));
	var qur = db.query('INSERT INTO user set ? ', req.body , function(err,rows){
		//if(err) throw err;
		console.log(rows);
		res.setHeader('Content-Type', 'application/json');
		res.redirect('/users/index');
	});

console.log("Query "+qur.sql);

});

router.get('/tweets', function(req, res, next) {
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

  //var params = {include_rts: false, since: y+"-"+m+"-"+d};
  // get the timeline of the logged in member
  client.get('statuses/show/785801965276127200.json?', function(error, tweets, response) {
    if (tweets.length <= 0) {
  		res.render('noTweet', { title: 'You have no tweets'});
    } else if (!error) {
  		res.render('userTweets', { title: 'User Information', dataGet: tweets });
    } else {
			console.log(error);
      res.send("Unknowed error" + error);
    }
  });
});

module.exports = router;
