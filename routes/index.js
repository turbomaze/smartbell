var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Smartbell' });
});

router.post('/', function(req, res) {
  var val = parseFloat(req.body.thing);
  console.log(val);
  res.send(''+(val*val)+'\n');
});

module.exports = router;
