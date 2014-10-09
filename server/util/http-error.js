function HttpError(msg, statusCode, error, redirect) {
  var err = new Error(msg);
  err.name = 'HttpError';
  err.message = msg;
  err.statusCode = statusCode;
  err.redirect = redirect;
  err.error = error;
  return err;
}

module.exports = HttpError;
