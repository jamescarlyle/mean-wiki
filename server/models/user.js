var mongoose  = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema  = mongoose.Schema;
// item schema
var UserSchema   = new Schema({
	emailAddress: { type: String, unique: true, required: true },
	password: { type: String },
	serverUpdate: { type: Date, default: Date.now }
}, {
	toJSON: {
		transform: function(doc, ret, options) {
			// take the internal _id and represent it externally as "id": left untransformed, mongoose does not ignore _id in PUT body, and mongo complains on save
			ret.id = ret._id;
			delete ret._id;
			// delete the password hash - no need to ever expose it
			delete ret.password;
		}
	}
});

UserSchema.methods.verifyPassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

UserSchema.methods.generateBearer = function(callback) {
	bcrypt.hash(process.env.GOOGLE_CLIENT_SECRET + this._id, null, null, function(err, hash) {
		if (err) return callback(err, null);
		callback(null, hash);
	});
};

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
	var user = this;
	// break out if the password hasn't changed
	if (!user.isModified('password')) return callback();
	// password changed so we need to hash it
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return callback(err);
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return callback(err);
			user.password = hash;
			callback();
		});
	});
});

// exports module for use in Node
module.exports = mongoose.model('User', UserSchema);