var async = require('async');
var uuid = require('node-uuid');
var HttpError = require('../util/http-error');

// Endpoint: /password/forgot
// GET Parameters: 
//    - username | required 
//    - key      | required
// Middlewares: 
//    - auth-password-key
// Action: Renders a page with a form allowing the user to reset their password. 
exports.index = function(req, res, next) {
  var data = {
    username: req.query.username,
    key: req.query.key
  };
  res.locals.username = req.query.username;
  res.locals.key = req.query.key;
  res.render('forgot-password');
};

// Endpoint: /password/forgot/reset
// GET Parameters:
//    - username | required
//    - key      | required
//    - password | required
//    - confirm  | required
// Middlewares:
//    - auth-password-key
//    - validate-password
// Action: Resets the users password, then redirects to a confirmation page.
exports.reset = function(req, res, next) {
  var user = res.locals.user;
  user.update(function(err, result) {
    if (err) {
      return next(new HttpError('Internal Server Error - Failed to update password', 500));
    }
    res.redirect('/password/forgot/confirmation');
  });
};

// Endpoint: /password/forgot/confirmation
// Action: Alerts a user that their password was successfully reset
exports.confirmation = function(req, res, next) {
  res.render('password-confirmation');
};

// Endpoint: /password/forgot/trigger/:email
// URL Parameters: 
//    - email | required
// Middlewares:
//    - auth-email
// Action: Creates a password reset key and emails a link to the requesting user. 
exports.trigger = function(req, res, next) {
  var user = res.locals.user; 
  async.series([
    setUpUserWithPasswordKey(user),
    user.sendPasswordKeyEmail.bind(user),
  ], asyncResultHandler(res, next));
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