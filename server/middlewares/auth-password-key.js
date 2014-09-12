var User = require('../models/user.js');
var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  if (!req.query.username) {
    return next(new HttpError('Missing username parameter', 406));
  }
  if (!req.query.key) {
    return next(new HttpError('Missing password key parameter', 406));
  }

  var user = new User({
  	username: req.query.username,
  	passwordKey: req.query.key
  });

  user.hasValidPasswordKey(function(err, result) {
  	if (err) {
  		console.error(err);
  		return next(new HttpError('Internal Server Error - Failed Database transaction', 500));
  	}
  	if (!result) {
  		return next(new HttpError('Invalid username/password key combination', 406));
  	}
  	res.locals.user = user;
  	return next();
  });
}