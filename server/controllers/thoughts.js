var ThoughtsCollection = require('../../test/server/collections/thoughts.js');
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
      return next(err);
    }
    res.json(result);
  });
};