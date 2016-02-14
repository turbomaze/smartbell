var express = require('express');
var router = express.Router();

var User = require('../models/User.js')

counter = 0
reps = []

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/add', function(req, res) {
  var quality = Math.random();
  var duration = Math.random() * 10000;

  console.log("quality", quality, "duration", duration);

  reps.push([counter, quality]);
  counter += 1;
  console.log("reps", reps);
  res.send(200);

});

// router.post('/add2', function(req, res) {
// 	var q = 
// });

router.post('/remove', function(req, res) {
	reps = []
	 res.send(200);

});

router.post('/reps', function(req, res) {

  res.send({"data": reps});
});

module.exports = router;
