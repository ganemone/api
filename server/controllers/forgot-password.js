var uuid = require('node-uuid');
var HttpError = require('../util/http-error');
var User = require('../models/user');

exports.index = function(req, res, next) {
  var validateResult = validateParameters(req.query);
  if (validateResult === true) {
    var data = {
      username: req.query.username,
      key: req.query.key
    };
    res.render('forgot-password', data);
  } else {
    next(validateResult);
  }
};

exports.reset = function(req, res, next) {
  var validateResult = validatePasswordRequest(req);
  if (validateResult === true) {
    res.render('password-reset');
  } else {
    next(validateResult);
  }
};

exports.trigger = function(req, res, next) {
  var validateResult = validateTriggerRequest(req);
  if (validateResult === true) {
    var user = new User({ 
      username: params.username,
      passwordKey: uuid.v4()
    });
    async.parallel([
      user.insertPasswordKey,
      user.sendPasswordKeyEmail
    ], function(err, result) {
      if (err) {
        return next(new HttpError('Failed to trigger password reset', 500));
      }
      res.end();
    });
  } else {
    next(validateResult);
  }
}

function validateParameters(params) {
  if (!params.username) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  if (!params.key) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  return true;
}

function validateTriggerRequest(req) {
  if (req.params.username) {
    return true;
  }
  return new HttpError('Missing or invalid parameters', 403);
}

function validatePasswordRequest(req) {
  var paramResult = validateParameters(req.params);
  var passwordResult = validatePasswordParams(req.params);
  if (paramResult !== true) {
    return paramResult;
  }
  if (passwordResult !== true) {
    return passwordResult;
  }
  return true;
}

function validatePasswordParams(params) {
  params.password = params.password || '';
  params.confirm = params.confirm || '';
  if (params.password < 7) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  if (params.confirm.length < 7) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  return true;
}