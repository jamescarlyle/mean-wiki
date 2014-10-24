var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;
// person schema
var PersonSchema   = new Schema({
	name: String,
	user_id: {type : Schema.Types.ObjectId, ref : 'User'},
	serverUpdate: { type: Number },
	emailAddress: String,
	mobileTelephone: String,
	homeAddress: String,
	twitterHandle: String,
	facebook: String,
	notes: String
}, {
	toJSON: {
		// take the internal _id and represent it externally as "id": left untransformed, mongoose does not ignore _id in PUT body, and mongo complains on save
		transform: function(doc, ret, options) {
			ret.id = ret._id;
			delete ret._id;
		}
	}
});
// TODO confirm that specification for multiple models is correct
module.exports = mongoose.model('Person', PersonSchema);