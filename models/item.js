var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
// item schema
var ItemSchema   = new Schema({
	name: String,
	updated: { type: Date, default: Date.now },
	content: String
});
// exports module for use in Node
module.exports = mongoose.model('Item', ItemSchema);