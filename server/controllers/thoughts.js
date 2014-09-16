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
  var thoughtsCollection = new ThoughtsCollection(user);
  thoughtsCollection.getThoughtsFeed(function(err, result) {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.json(result);
  });
};