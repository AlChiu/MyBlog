var router = require('express').Router(),
	passport = require('passport');

/* require models */
var User = require('./models/user');

router.get('/', function(req, res){
	res.render('index', {user: req.user});
});

router.get('/register', function(req, res){
	res.render('register', {});
});



module.exports = router;