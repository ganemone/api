var async = require('async');
var uuid = require('node-uuid');
var HttpError = require('../util/http-error');
var User = require('../models/user');

// Endpoint: /password/forgot
// GET Parameters: 
//    - username | required 
//    - key      | required
// Action: Renders a page with a form allowing the user to reset their password. 
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

// Endpoint: /password/forgot/reset
// GET Parameters:
//    - username | required
//    - key      | required
//    - password | required
//    - confirm  | required
// Action: Resets the users password, then redirects to a confirmation page.
exports.reset = function(req, res, next) {
  var validateResult = validatePasswordRequest(req);
  if (validateResult === true) {
    var user = new User({
      username: req.params.username,
      password: req.params.password,
      passwordKey: req.params.key
    });

    user.hasValidResetPasswordKey(function(err, hasValidResetPasswordKey) {
      if (!hasValidResetPasswordKey) {
        return next(new HttpError('Invalid Password Key', 406));
      }
      user.update(function(err, result) {
        if (err) {
          return next(new HttpError('Internal Server Error - Failed to update password', 500));
        }
        res.redirect('/password/forgot/confirmation');
      });
    });
  } else {
    next(validateResult);
  }
};

// Endpoint: /password/forgot/confirmation
// Action: Alerts a user that their password was successfully reset
exports.confirmation = function(req, res, next) {
  res.render('password-confirmation');
}

// Endpoint: /password/forgot/trigger/:email
// URL Parameters: 
//    - email | required
// Action: Creates a password reset key and emails a link to the requesting user. 
exports.trigger = function(req, res, next) {
  // Check if email was passed as url parameter
  if (req.params.email) {
    // Create user object with email 
    var user = new User({ 
      email: req.params.email,
    });
    async.series([
      user.loadFromEmail.bind(user),
      setUpUserWithPasswordKey(user),
      user.sendPasswordKeyEmail.bind(user),
    ], asyncResultHandler(res, next));
  }
};

// Helper function for handling calls using the async library.
// If an error occurs, send it to the shared error handler.
// Otherwise, return JSON data based on an index.
function asyncResultHandler(res, next, index) {
  return function(err, results) {
    if (err) {
      return next(err);
    }
    if (index) {
      res.json(results[index]);
    } else {
      res.end();
    }
  };
}

// Genereates and saves a password key for a given user object.
function setUpUserWithPasswordKey(user) {
  return function(cb) {  
    console.log('Setting up User with password');
    console.log('cb', cb);
    user.passwordKey = uuid.v4();
    user.insertPasswordKey(cb);
  };
}

// Checks request for username and key parameters
function validateParameters(params) {
  if (!params.username) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  if (!params.key) {
    return new HttpError('Missing or invalid parameters', 403);
  }
  return true;
}

// Checks request for username, key, password, and confirm parameters
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

// Checks request for password and confirm parameters
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