var HttpError = require('../util/http-error');
var User = require('../models/user');

exports.index = function(req, res, next) {
  var validateResult = validateRequest(req);
  if (validateResult === true) {
    var user = new User(req.params.username, req.params.key);
    res.render('forgot-password', {
      locals: {
        user: user
      }
    });
  } else {
    next(validateResult);
  }
};

function validateRequest(req) {
  var params = req.params;
  if (!params.username) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  if (!params.key) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  return true;
}
