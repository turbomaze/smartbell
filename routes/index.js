var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/', function(req, res) {
  console.log(req.header('data'));
  res.send(Math.random());
});

module.exports = router;
