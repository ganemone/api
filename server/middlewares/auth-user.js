var User = require('../models/user.js');
var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  if (!req.query.username) {
    return next(new HttpError('Missing username parameter', 406));
  }
  if(!req.query.session) {
    return next(new HttpError('Missing session parameter', 406));
  }
  var user = new User({
    username: req.query.username,
    sessionID: req.query.session
  });

  user.hasValidSessionID(function(err, result) {
    if (err) {
      return next(new HttpError('Invalid parameters', 406));
    }
    res.locals.user = user;
    return next();
  });
}