var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	author: String,
	created: Date,
	body: String,
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

module.exports = mongoose.model('Comment', CommentSchema);