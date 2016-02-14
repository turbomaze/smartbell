var mongoose = require("mongoose");

var setSchema = mongoose.Schema({
	dumbbellId: {type: 'String', required: true },
	reps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rep', required: false }],
	open: { type: Boolean, required: true },
});

/**
* Creates Set object
* @param username: username of the owner of this Set
*/
setSchema.methods.createSet = function(dumbbellId, cb) {
	this.create({
		dumbbellId: dumbbellId,
		reps: [],
		open: true,
	}, cb);
};

/**
* Creates Set object
* @param username: username of the owner of this Set
*/
setSchema.methods.addRep = function(rep, cb) {
	if (this.open) {
		this.reps.push(rep);
		this.save(cb);
		cb(null); // TODO error handling?
	} else {
		cb("done");
	}
};

setSchema.methods.closeSet = function(cb) {
	this.open = false;
	this.save(cb);
}


module.exports = mongoose.model("Set", setSchema);