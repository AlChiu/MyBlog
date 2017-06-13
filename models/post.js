var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	author: {type: String, default: 'Alexander Chiu'},
	title: String,
	markBody: String,
	formattedBody: String,
	created: Date,
	comments: [{type: mongoose.Schema.Types.ObjectId, ref:'Comment'}]
});

module.exports = mongoose.model('Post', PostSchema);