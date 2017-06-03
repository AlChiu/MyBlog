/*jslint node: true */
'use strict';

/* Importing modules */
var express = require('express'),
	exphbs = require('express-handlebars'),
	expressHelpers = require('handlebars-helpers'),
	messages = require('express-messages'),
	session = require('express-session'),
	validator = require('express-validator'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	path = require('path'),
	flash = require('connect-flash'),
	morgan = require('morgan'),
	promises = require('q'),
	helpers = require('./public/js/helper');

/* Let the part start - configure the app */
var app = express();

/* Set viewing engine */
app.set('views', path.join(__dirname, 'views'));
var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: helpers
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

/* Set up logger */
app.use(morgan('dev'));

/* Set parsing configuration */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser('your secret here'));

/* Set up the validator */
app.use(validator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'), 
      	  root    = namespace.shift(),
      	  formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

/* Set up method overrides for PUT and DELETE */
app.use(methodOverride("_method"));

/* Static public path */
app.use(express.static(path.join(__dirname, 'public')));

/* Set sessions */
app.use(session({
	secret: 'red na xela',
	saveUninitialized: true,
	resave: true
}));

/* Passport config */
app.use(passport.initialize());
app.use(passport.session());
var User = require('./models/user');
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Set and use flash */
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

/* MongoDB connection */
var db = require('./config/db');

/* Set up routes */
var routes = require('./routes/routes');
app.use('/', routes);

/*Set Port								            */
app.listen(3000, function(){
  console.log('Server listening on Port: 3000');
});