var express = require('express');
var router = express.Router();

var User = require('../models/User.js')
var Set = require('../models/Set.js')
var Rep = require('../models/Rep.js')

/*
  POST /sets/start
  Request body:
    - dumbbellId: id of dumbbell that sent POST request
  Response:
    - success: true if the server succeeded in creating set
    - err: on failure, an error message
*/
router.post('/start', function(req, res) {

  console.log("hi");

  User.checkForOpenSet(
    req.body.dumbbellId,
    function(error) {
      if (error) {
        // Let's create a set.
        User.createSet(req.body.dumbbellId, function(e) {
          if (e) {
            return next(e);
          } else {
            // Successfully created a set!
            console.log("starting set...");
          }
        });
      }
    });
});

/*
  POST /sets/rep
  Request body:
    - dumbbellId: id of dumbbell that sent POST request
    - quality: percentage representing how good rep was
    - duration: time duration of rep
  Response:
    - success: true if the server succeeded in adding rep to set
    - err: on failure, an error message
*/
router.post('/rep', function(req, res) {
  // Call User model to search for user that owns the dumbbell
  // If successful, check if any sets are open
  // If no sets are open, call Set.createSet()
  // else, find the open Set, create a Rep and add to the Set.

  User.checkForOpenSet(
    req.body.dumbbellId,
    function(error, set) {
      if (error) {
        // Error, no open set.
        console.log("error");
        return next(error);

      } else {
        console.log("success");
        // There is an open set!
        // Add the rep to it.
        set.addRep(
          req.body.quality,
          req.body.duration,
          function(e) {
            if (e) {
              // Error!
              return next(e);

            } else {
              // Success!
              res.send({"msg": "DONE"});
            }
          }
        )
      }
    });

});


/*
  POST /sets/end
  Request body:
    - dumbbellId: id of dumbbell that sent POST request
  Response:
    - success: true if the server succeeded in creating set
    - err: on failure, an error message
*/
router.post('/end', function(req, res) {

  User.checkForOpenSet(
    req.body.dumbbellId,
    function(error) {
      if (error) {
        return next(error);
      } else {
        // Close the open set!
        // Let's create a set.
        User.closeOpenSet(req.body.dumbbellId, function(e) {
          if (e) {
            return next(e);
          } else {
            // Successfully closed set!
            console.log("ending set...");
          }
        });
      }
    });
});

module.exports = router;
