var async = require('async');
var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  var user = res.locals.user;
  async.series([
    user.loadFriends.bind(user),
    user.loadSecondDegreeFriends.bind(user)
  ], function(err, result) {
    console.error(err);
    if (err) {
      return next(err);
    }
    return next();
  });
};
