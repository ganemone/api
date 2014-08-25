function HttpError(msg, statusCode) {
  var err = new Error(msg);
  err.name = 'HttpError';
  err.statusCode = statusCode;
  return err;
}

module.exports = HttpError;
