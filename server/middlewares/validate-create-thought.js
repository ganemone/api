var async = require('async');
var Thought = require('../models/thought.js');
var HttpError = require('../util/http-error.js');

module.exports = function (req, res, next) {
  if (!req.body.cid) {
    return next(new HttpError('Missing a cid parameter', 406));
  }
  var thought = new Thought(req.body.cid);
  var username = res.locals.user.username;
  async.waterfall([
    thought.load.bind(thought),
    function(exists, cb) {
      if (!exists) {
        return cb(new HttpError('Requested thought does not exist', 406));
      }
      thought.getDegreeFromUser(username, cb);
    }
  ], function(err, degree) {
    if (err) {
      return next(err);
    }
    res.locals.thought = thought;
    res.locals.chat.degree = degree;
    res.locals.chat.participants = [thought.username];
    return next();
  });
};