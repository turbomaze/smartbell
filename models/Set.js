var mongoose = require("mongoose");
var Rep = require('../models/Rep.js');


var setSchema = mongoose.Schema({
	username: { type: String, required: true },
	reps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rep', required: false }],
	open: { type: Boolean, required: true },
});

/**
* Creates Set object
* @param username: username of the owner of this Set
*/
setSchema.statics.createSet = function(username, cb) {
	this.create({
		username: username,
		reps: [],
		open: true,
	}, cb);
};

/**
* Creates Set object
* @param username: username of the owner of this Set
*/
setSchema.statics.addRep = function(rep, cb) {
	if (this.open) {
		this.reps.push(rep);
		this.save(cb);
		cb(null); // TODO error handling?
	} else {
		cb(null);
	}
};



module.exports = mongoose.model("Set", setSchema);