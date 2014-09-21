var HttpError = require('../util/http-error.js');

module.exports = function (req, res, next) {
  if (req.body.participants.length === 1) {
    return next(new HttpError('Groups must have 3 or more participants', 406));
  }
  if (!req.body.name) {
    return next(new HttpError('Groups must have a name attribute', 406));
  }
  return next();
};