var Schema = require ('mongoose').Schema;

var PostSchema = module.exports = new Schema({
	url: {
		type : String,
		index : {
			unique : true
		}
	},
	guid : {
		type : String,
		index : {
			unique : true
		}
	},
	title: String,
	content: String,
	created : Date,
	updated : Date,
	deleted : Date,
	published : Date,
	isPublished: Boolean,
	updateSequenceNum : Number,
	tags : [],
}, {
	_id : true
});