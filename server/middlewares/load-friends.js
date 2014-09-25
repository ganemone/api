var async = require('async');

exports.first = function(req, res, next) {
  var user = res.locals.user;
  user.loadFriends(function (err, result) {
    if (err) {
      return next(err);
    }
    return next();
  });
};

exports.second = function(req, res, next) {
  var user = res.locals.user;
  async.series([
    user.loadFriends.bind(user),
    user.loadSecondDegreeFriends.bind(user)
  ], function (err, result) {
    if (err) {
      return next(err);
    }
    return next();
  });
};

exports.pending = function(req, res, next) {
  var user = res.locals.user;
  user.loadPendingFriends(function (err, result) {
    if (err) {
      return next(err);
    }
    return next();
  });
};