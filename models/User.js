var mongoose = require("mongoose");
var Rep = require('../models/Rep.js');
var Set = require('../models/Set.js');


var userSchema = mongoose.Schema({
	username: {type: 'String', required: true},
	dumbbellId: {type: 'String', required: true },
	sets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Set', required: false }]
});

/*
User Model method that finds a User object that owns the dumbbell Id
@param: dumbbelId - dumbbell Id in use
*/
userSchema.methods.findByDumbbellId = function(dumbbellId, cb) {
	this.findOne({ dumbbellId: dumbbellId }, function(error, user) {
		if (error) {
			cb(error);
		} else {
			cb(null, user)
		}
	});
}

userSchema.methods.createSet = function(dumbbellId, cb) {
	var that = this;
	Set.createSet(dumbbellId, function(error, set) {
		if (error) {
			cb(error);
		} else {
			that.sets.push(set);
			that.save(cb);
		}
	});
}

userSchema.methods.checkForOpenSet = function(dumbbellId, cb) {

	this.findOne({ dumbbellId: dumbbellId }, function(error, user) {
		if (error) {
			cb(error);
		} else {
			var openSet = false;
			user.sets.forEach(function(s) {
				if (s.open) {
					openSet = true;
				}
			});

			if (openSet) {
				cb(null);
			} else {
				cb({"msg": "No open sets."});
			}
		}
	});
}

userSchema.methods.closeOpenSet = function(dumbbellId, cb) {
	this.findOne({ dumbbellId: dumbbellId }, function(error, user) {
		if (error) {
			cb(error);
		} else {
			var openSet = false;
			user.sets.forEach(function(s) {
				if (s.open) {
					s.closeSet(cb);
				}
			});
		}
	});
}

userSchema.methods.getRepsAsList = function(dumbbellId, cb) {
	var allSets = []
	this.sets.forEach(function(s) {
		allSets.concat(s); // List of all the user's Reps
	});

	var allReps = allSets.map(function(i, rep, allSets) {
		return [i, rep.quality, rep.duration]
	});

	cb(null, allReps);
}

module.exports = mongoose.model("User", userSchema);
