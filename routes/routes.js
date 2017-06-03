/*jslint node: true */
'use strict';

/* Import dependencies */
var router = require('express').Router(),
	passport = require('passport');
	//mongoose = require('mongoose');

/* Set up mongoose to use q promises */
//mongoose.Promise = require('q').Promise;

/* require models */
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');

/* Render the home page and with user data */
/* Populate homepage with posts */
router.get('/', function(req, res){
	Post.find({}).sort({created: -1}).exec(function(err, posts){
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
	/* Trim and sanitize the new post */
	req.sanitize('postTitle').escape();
	req.sanitize('postTitle').trim();
	req.sanitize('postBody').escape();

	Post.create({title: req.body.postTitle, body: req.body.postBody, created: Date.now()}, function(err, newPost){
		if(err)
			res.render('new');
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

/* Show the specific blog post */
router.get('/:post', function(req, res){
	Post.findById(req.params.post, function(err, foundPost){
		if(err){
			console.log(err);
			res.redirect('/');
		}
		else
			Comment.find({post: req.params.post}).sort({created: 1}).exec(function(err, foundComment){
				if(err){
					console.log(err);
					res.redirect('/');
				}
				else
					res.render('post', {user: req.user, post: foundPost, comment: foundComment});
			});
	});
});

/* Add Comments to the specific blog post */
router.post('/:post/comment', function(req, res){
	/* Sanitize the comment */
	req.sanitize('postComment').escape();

	Comment.create({author: req.user.username, created: Date.now(), body: req.body.postComment, post: req.body.postID}, function(err, newComment){
		if(err){
			console.log(err);
			res.redirect('/');
		}
		else
			res.redirect('/'+req.body.postID);
	});
});

/* Update selected post */
router.put('/:post', function(req, res){
	req.body.body = req.sanitize(res.body.body);
	Post.findByIdAndUpdate(req.params.post, req.body.body, function(err, updatedPost){
		if(err){
			console.log('err:'+ err);
			res.redirect('/'+req.params.post+'/edit');
		}
		else
			res.redirect('/:id');
	});
});

/* Delete a post */
router.delete('/:post', function(req, res){
	Post.findByIdAndRemove(req.params.post, function(err){
		if(err){
			console.log(err);
			res.redirect('/'+req.params.post);
		}
		else
			res.redirect('/');
	});
});

module.exports = router;