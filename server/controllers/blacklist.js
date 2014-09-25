var Blacklist = require('../models/blacklist');
var logger = require('../util/logger');
var request = require('request');

exports.index = function(req, res, next) {
  var user = res.locals.user;
  var phones = req.body.phones;
  var emails = req.body.emails;
  var blist = Blacklist(user, phones, emails);
  blist.makeRequest(function(err, foundFriends) {
    if (err) {
      return next(err);
    }
    if (foundFriends) {
      request.get('http://localhost:5290/notify/blm/' + user.username, function(err, response) {
        if (err) {
          logger.error('Failed to notify users after blacklist request', { error: err });
        }
        if (response.statusCode !== 200) {
          logger.error('Response code from notify users not 200', response.statusCode);
        }
      });
    }
    res.end();
  });
};