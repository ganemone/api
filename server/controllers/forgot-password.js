var HttpError = require('../util/http-error');
var User = require('../models/user');

exports.index = function(req, res, next) {

};

function validateRequest(req) {
  var params = req.params;
  if (!params.username) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  if (!params.key) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  var user = new User(params.username);


}
