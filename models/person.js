var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;
// person schema
var PersonSchema   = new Schema({
	name: String,
	user: {type : Schema.Types.ObjectId, ref : 'User'},
	serverUpdate: { type: Number },
	emailAddress: String,
	mobileTelephone: String,
	homeAddress: String,
	twitterHandle: String,
	facebook: String,
	notes: String
});
// TODO confirm that specification for multiple models is correct
module.exports = mongoose.model('Person', PersonSchema);