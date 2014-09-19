var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  var phones = req.body.phones;
  var emails = req.body.emails;
  if (!phones || !emails) {
    return next(new HttpError('Missing required parameters', 406));
  }
  if (phones.length === 0 && emails.length === 0) {
    return res.end();
  }
  return next();
};