var Blacklist = require('../models/blacklist.js');
var logger = require('../util/logger.js');
var request = require('request');

// 5290/notify/blm/username
exports.index = function(req, res, next) {
  var user = res.locals.user;
  var phones = req.body.phones;
  var emails = req.body.emails;

  var blist = new Blacklist(user, phones, emails);

  blist.makeRequest(function(err, foundFriends) {
    if (err) {
      return next(err);
    }
    res.end();
    if (foundFriends) {
      request.get('http://localhost:5290/notify/blm/' + user.username, function(err, response) {
        if (err) {
          logger.error('Failed to notify users after blacklist request', {error: err, phones: phones, emails: emails});
        }
        if (response.statusCode !== 200) {
          logger.error('Response code from notify users not 200', {response: response});
        }
      });
    }
  });
};