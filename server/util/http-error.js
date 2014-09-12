function HttpError(msg, statusCode, redirect) {
  var err = new Error(msg);
  err.name = 'HttpError';
  err.statusCode = statusCode;
  err.redirect = redirect;
  return err;
}

module.exports = HttpError;
