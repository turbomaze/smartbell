var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  dumbbellId: {type: 'String', required: true },
	sets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Set', required: false }]
});

module.exports = mongoose.model("User", userSchema);
