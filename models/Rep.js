var mongoose = require("mongoose");

var repSchema = mongoose.Schema({
	quality: { type: 'Number', required: true },
	duration: { type: 'Number', required: true },
});

/**
* Creates Rep object
* @param username: username of the owner of this Set
*/
repSchema.methods.createRep = function(quality, duration, cb) {
	this.create({
		quality: quality
		duration: duration,
	}, cb);
};

module.exports = mongoose.model("Rep", repSchema);