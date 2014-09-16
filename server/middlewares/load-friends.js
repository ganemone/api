var async = require('async');

module.exports = function(req, res, next) {
  var user = res.locals.user;
  async.series([
    user.loadFriends.bind(user),
    user.loadSecondDegreeFriends.bind(user)
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    return next();
  });
};
