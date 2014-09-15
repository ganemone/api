var HttpError = require('../util/http-error.js');

module.exports = function(req, res, next) {
  var password = req.query.password;
  var confirm = req.query.confirm;
  var message;
  if (!password) {
    message = 'The password field is required';
  } else if (!confirm) {
    message = 'The confirm password field is required';
  } else if (password.length < 7) {
    message = 'Your password must be at least 7 characters long';
  } else if (password !== confirm) {
    message = 'Passwords do not match';
  }
  if (message) {
    return next(new HttpError(message, 406, '/password/forgot'));
  }
  res.locals.user.password = password;
  return next();
};
