/*jslint node: true */
'use strict';

/* Import dependencies */
var router = require('express').Router(),
	passport = require('passport'),
	marked = require('marked');
	//mongoose = require('mongoose');

/* Set up mongoose to use q promises */
//mongoose.Promise = require('q').Promise;

/* require models */
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');

/* marked options */
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code){return require('highlight.js').highlightAuto(code).value;},
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

/* Function to ensure that user is authenticated for specific pages */
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

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
router.get('/new', ensureAuthenticated, function(req, res){
	res.render('new', {user: req.user});
});

/* Save new post */
router.post('/new', function(req, res){
	/* Trim and sanitize the new post */
	req.sanitize('postTitle').escape();
	req.sanitize('postTitle').trim();

	marked(req.body.postBody, function(err, content){
		if(err) throw err;
		else{
			Post.create({title: req.body.postTitle, markBody: req.body.postBody, formattedBody: content, created: Date.now()}, function(err, newPost){
				if(err)
					res.render('new');
				else
					res.redirect('/');
			});
		} 
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

/* Delete a post */
router.delete('/:post', function(req, res){
	Post.findByIdAndRemove(req.body.postID, function(err){
		if(err){
			console.log(err);
			res.redirect('/'+req.body.postID);
		}
		else{
			Comment.deleteMany({post: req.body.postID}, function(err){
				if(err){
					console.log(err);
					res.redirect('/'+req.body.postID);
				}
				else
					res.redirect('/');
			});
		}
	});
});

/* Edit Post Route */
router.get('/:post/edit', ensureAuthenticated, function(req, res){
	Post.findById(req.params.post, function(err, foundPost){
		if(err){
			console.log(err);
			res.redirect('/'+req.params.post);
		}
		else res.render('edit', {post: foundPost});
	});
});

/* Update selected post */
router.put('/:post/edit', function(req, res){
	req.sanitize('postTitle').escape();
	req.sanitize('postBody').escape();
	marked(req.body.markBody, function(err, updatedContent){
		Post.findById(req.body.postID, function(err, updatedPost){
			if(err){
				console.log(err);
				res.redirect('/');
			}
			else{
				updatedPost.markBody = req.body.markBody;
				updatedPost.formattedBody = updatedContent;
				updatedPost.save(function(err){
					if(err){
						console.log(err);
						res.redirect('/');
					}
					else
						res.redirect('/'+req.body.postID);
				});
			}
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

module.exports = router;