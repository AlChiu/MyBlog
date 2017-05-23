var mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
	type: String,
	username: String,
	password: String,
	created: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);