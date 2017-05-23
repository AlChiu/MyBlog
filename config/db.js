/*jslint node: true */
'use strict';

/* Import mongoose to set up the database configuration */
var mongoose = require("mongoose");

/* string of connection endpoint */
var ADDRESS = "mongodb://localhost:27017/MyBlog";

/* Connect to the database */
var connection = mongoose.connect(ADDRESS);

module.exports = connection;