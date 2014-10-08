var Blacklist = require('../models/blacklist');
var HttpError = require('../util/http-error.js');
var UserCollection = require('../collections/user.js');

exports.index = function (req, res, next) {
  var user = res.locals.user;
  var phones = req.body.phones;
  var emails = req.body.emails;
  var blist = Blacklist(user, phones, emails);

  blist.hasMadeRequest(function (err, hasMadeRequest) {
    if (err) {
      return next(err);
    }
    if (hasMadeRequest) {
      return next(new HttpError('User already made blacklist request', 406));
    }
    makeRequest(blist, res, next);
  });
};

function makeRequest(blist, res, next) {
  blist.makeRequest(function (err, foundFriends) {
    if (err) {
      return next(err);
    }
    var users = UserCollection(blist.user.friends);
    var push = {
      "message": "You have a new friend on Versapp!",
      "type": "blacklist"
    };
    users.notify(push);
    res.end();
  });
}