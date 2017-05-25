var router = require('express').Router(),
	passport = require('passport');

/* require models */
var User = require('../models/user');

router.get('/', function(req, res){
	res.render('index', {user: req.user});
});

router.get('/register', function(req, res){
	res.render('register', {});
});

/* Registers the new user */
router.post('/register', function(req, res){
	User.register(new User({type: 'normal', username: req.body.username, created: Date.now()}), req.body.password, function(err, user){
		if(err){
			return res.render('register', {user: user});
		}
		passport.authenticate('local')(req, res, function(){
			res.redirect('/');
		});
	});
});

router.get('/login', function(req, res){
	res.render('login', {user: req.user});
});

router.post('/login', passport.authenticate('local'), function(req, res){
	res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/ping', function(req, res){
	res.send("pong!", 200);
});

module.exports = router;