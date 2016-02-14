var mongoose = require("mongoose");

var repSchema = mongoose.Schema({
	quality: { type: 'Number', required: true },
	duration: { type: 'Number', required: true },
});

module.exports = mongoose.model("Rep", repSchema);