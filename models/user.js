var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;
// item schema
var UserSchema   = new Schema({
	name: String,
	emailAddress: String,
	passwordHash: String,
	serverUpdate: { type: Date, default: Date.now }
}, {
	toJSON: {
		// take the internal _id and represent it externally as "id": left untransformed, mongoose does not ignore _id in PUT body, and mongo complains on save
		transform: function(doc, ret, options) {
			ret.id = ret._id;
			delete ret._id;
		}
	}
});

// exports module for use in Node
module.exports = mongoose.model('User', UserSchema);