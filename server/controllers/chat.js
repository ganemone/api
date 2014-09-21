// External Modules
var async = require('async');
var request = require('request');
var url = require('url');

// Endpoint /chat/create
// Method: POST
// Auth: Basic
// Parameters: 
//    - type | required
//    - participants | required
//    - cid | required if type === 'thought'
//    - name | required if type === 'group'
// Middlewares:
//    - auth-user
//    - json body parser
//    - validate-create-chat
// Action: creates a chat
exports.create = function (req, res, next) {
  var chat = res.locals.chat;
  
  if (chat.type === 'thought') {
    chat.name = res.locals.thought.body;
  }

  async.series([
    chat.insert.bind(chat),
    chat.insertParticipants.bind(chat),
    function(cb) {
      if (chat.type === 'group') {
        return notifyParticipants(chat, cb);
      }
      cb();
    }
  ], function (err, result) {
    if (err) {
      return next(err);
    }
    res.json(chat.toJSON()); 
  });
};

// Endpoint /chat/leave
// Method: POST
// Auth: Basic
// Parameters: 
//    - chatUUID | required
// Middlewares:
//    - auth-user
//    - json body parser
//    - validate-chat
// Action: Sets a users status to inactive in a chat
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

// Endpoint /chat/join
// Method: POST
// Auth: Basic
// Parameters: 
//    - chatUUID | required
// Middlewares:
//    - auth-user
//    - json body parser
//    - validate-chat
// Action: Sets a users status to active in a chat
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

