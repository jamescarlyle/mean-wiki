var mongoose  = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema  = mongoose.Schema;
// item schema
var UserSchema   = new Schema({
	name: String,
	emailAddress: {type: String, unique: true, required: true},
	password: {type: String, required: true},
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

UserSchema.methods.verifyPassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;
  // break out if the password hasn't changed
  if (!user.isModified('password')) return callback();
  // password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
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