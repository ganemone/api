var HttpError = require('../util/http-error.js');
var User = require('../models/user.js');

module.exports = function(req, res, next) {
	if (!req.params.email) {
		return next(new HttpError(null, 'Missing email parameter', 406));
	}
	var user = new User({
		email: req.params.email
	});

	user.loadFromEmail(function(err, result) {
		if (err) {
			return next(err);
		}
		if (result) {
			res.locals.user = user;
			return next();
		}
		res.end();
	});
};
