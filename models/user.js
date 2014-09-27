var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;
// item schema
var UserSchema   = new Schema({
	name: String,
	emailAddress: String,
	passwordHash: String,
	serverUpdate: { type: Date, default: Date.now }
});

// exports module for use in Node
module.exports = mongoose.model('User', UserSchema);