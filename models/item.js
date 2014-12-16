var mongoose  = require('mongoose');
var Schema  = mongoose.Schema;
// item schema
var ItemSchema   = new Schema({
	name: { type: String, unique: true },
	user_id: {type : Schema.Types.ObjectId, ref : 'User'},
	serverUpdate: { type: Number },
	content: String
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
module.exports = mongoose.model('Item', ItemSchema);