var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  if (!req.body.username) {
    return next(new HttpError('Missing required username parameter', 406));
  }
  next();
};