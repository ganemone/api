var async = require('async');

module.exports = function(req, res, next) {
  var user = res.locals.user;
  async.series([
    user.loadFriends.bind(user),
    user.loadSecondDegreeFriends.bind(user)
  ], function(err, result) {
    if (err) {
      return next(new HttpError('Internal Server Error - Failed to load user friends', 500));
    }
    return next();
  });
}