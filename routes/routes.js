var router = require('express').Router(),
	passport = require('passport');

/* require models */
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/post');

/* Render the home page and with user data */
/* Populate homepage with posts */
router.get('/', function(req, res){
	Post.find({}).sort({'created': -1}).exec(function(err, posts){
		if(err)
			console.log('error:' + err);
		else
			res.render('index', {user: req.user, posts: posts});
	});
});

/* Render the post creation */
/* Only users with admin user type can create new posts */
router.get('/new', function(req, res){
	res.render('new', {user: req.user});
});

/* Save new post */
router.post('/new', function(req, res){
	req.body.body = req.sanitize(req.body.body);
	Post.create({title: req.body.title, body: req.body.body, created: Date.now()}, function(err, newPost){
		if(err)
			res.render('/new');
		else
			res.redirect('/');
	});
});

/* Show the specific blog post */
router.get('/:id', function(req, res){
	Post.findById(req.params.id, function(err, foundPost){
		if(err){
			console.log(err);
			res.redirect('/');
		}
		else
			res.render('/post', {post: foundPost});
	});
});

/* Update selected post */
router.put('/:id', function(req, res){
	req.body.body = req.sanitize(res.body.body);
	Post.findByIdAndUpdate(req.params.id, req.body.body, function(err, updatedPost){
		if(err){
			console.log('err:'+ err);
			res.redirect('/'+req.params.id+'/edit');
		}
		else
			res.redirect('/'+req.params.id);
	});
});

/* Delete a post */
router.delete('/:id', function(req, res){
	Post.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect('/'+req.params.id);
		}
		else
			res.redirect('/');
	});
});

/* Render the register page */
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

/* Render the login page */
router.get('/login', function(req, res){
	res.render('login', {user: req.user});
});

/* Login the user */
router.post('/login', passport.authenticate('local'), function(req, res){
	res.redirect('/');
});

/* Log user out */
router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/ping', function(req, res){
	res.send("pong!", 200);
});

module.exports = router;