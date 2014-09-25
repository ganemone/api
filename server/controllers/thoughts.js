var HttpError = require('../util/http-error.js');
var Thought = require('../models/thought.js');
var ThoughtsCollection = require('../collections/thoughts.js');
// Endpoint: /thoughts
// Method: GET
// Parameters:
//    - since | optional
// Middlewares:
//    - auth-user
//    - load-friends
// Action: Returns a JSON list of thoughts
exports.index = function(req, res, next) {
  var user = res.locals.user;
  var since = req.query.since;
  var thoughtsCollection = new ThoughtsCollection(user, since);
  thoughtsCollection.getThoughtsFeed(function(err, result) {
    if (err) {
      return next(err);
    }
    res.json(result);
  });
};

exports.thought = function(req, res, next) {
  var cid = req.params.id;
  var thought = Thought(cid);
  thought.load(function(err, result) {
    if (err) {
      return next(err);
    }
    if (!result) {
      return next(new HttpError('Thought not found', 404));
    }
    res.json(thought.toJSON());
  });
};