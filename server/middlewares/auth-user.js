var BasicAuth = require('basic-auth');
var User = require('../models/user.js');
var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  var authUser = BasicAuth(req);

  if (!authUser) {
    return next(new HttpError('Failed to authenticate user', 403));
  }

  var user = new User({
    username: authUser.name,
    sessionID: authUser.pass 
  });

  user.hasValidSessionID(function(err, result) {
    if (err) {
      return next(new HttpError('Failed to authenticate user', 403));
    }
    res.locals.user = user;
    return next();
  });
};
