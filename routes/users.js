var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('user');
});

router.post('/:id/reps', function(req, res) {
	var n = parseInt(req.body.n);
	var ret = [];
	var cum = 0;
	for (var ai = 0; ai < 10; ai++) {
		ret.push([ai, cum]);
		cum += Math.random();
	}
	res.send({data: ret});
});

module.exports = router;
