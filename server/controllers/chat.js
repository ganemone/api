// External Modules
var async = require('async');
var request = require('request');
var url = require('url');
// Internal Modules
var Chat = require('../models/chat.js');

// Endpoint
exports.create = function (req, res, next) {
  var user = res.locals.user;
  var chat = res.locals.chat;
  async.series([
    chat.insert.bind(chat),
    chat.insertParticipants.bind(chat),
    function(result, cb) {
      if (chat.type === 'group') {
        notifyParticipants(chat, cb);
      }
    }
  ], function (err, result) {
    if (err) {
      return next(err);
    }
    res.json(chat.toJSON()); 
  });
};

exports.leave = function (req, res, next) {
  var user = res.locals.user;
  var chat = res.locals.chat;
  chat.removeUser(user, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json();
  }); 
};

exports.join = function (req, res, next) {
  var user = res.locals.user;
  var chat = res.locals.chat;
  chat.joinUser(user, function (err, result) {
    if (err) {
      return next(err);
    }
    res.json();
  });
};

function notifyParticipants(chat, cb) {
  var notifyURL = url.format({
    protocol: 'http:',
    host: 'localhost',
    pathname: '/notify/new_group',
    query: {
      id: chat.id
    }
  });
  request.get(notifyURL, cb);
}

