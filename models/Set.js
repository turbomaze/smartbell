var mongoose = require("mongoose");

var setSchema = mongoose.Schema({
	username: { type: String, required: true },
	reps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rep', required: false }],
});

module.exports = mongoose.model("Set", setSchema);