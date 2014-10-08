// External Modules
var _ = require('underscore');
var async = require('async');
var request = require('request');
var url = require('url');
var sendPush = require('../util/sendPush.js');
var AsyncHelper = require('../util/async-helper.js');
var User = require('../models/user.js');
var UserCollection = require('../collections/user.js');
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
    chat.cid = res.locals.thought.id;
  }

  async.series([
    chat.insert.bind(chat),
    chat.insertParticipants.bind(chat),
    chat.loadParticipantsNames.bind(chat),
    notifyIfGroup(chat)
  ],
  function (err, result) {
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
//    - uuid | required
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
//    - uuid | required
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

// Endpoint /chat/joined
// Method: GET
// Auth: Basic
// Parameters: None
// Middlewares:
//    - auth-user
// Action: Returns a json list of the users joined chats
exports.joined = function (req, res, next) {
  var user = res.locals.user;
  user.getJoinedChats(function (err, joinedChats) {
    if (err) {
      return next(err);
    }
    handleChatsResponse(joinedChats, res, next);
  });
};

// Endpoint /chat/pending
// Method: GET
// Auth: Basic
// Parameters: None
// Middlewares:
//    - auth-user
// Action: Returns a json list of the users pending chats
exports.pending = function (req, res, next) {
  var user = res.locals.user;
  user.getPendingChats(function (err, pendingChats) {
    pendingChats.loadParticipants(function (err, result) {
      if (err) {
        return next(err);
      }
      handleChatsResponse(pendingChats, res, next);
    });
  });
};

function handleChatsResponse(chats, res, next) {
  async.series([
    chats.loadParticipants.bind(chats),
    chats.loadParticipantsNamesIfGroup.bind(chats),
    chats.loadParticipantsNamesIf121.bind(chats)
  ], function (err, result) {
    if (err) {
      return next(err);
    }
    res.json(chats.toJSON());
  });
}

function notifyIfGroup(chat) {
  return function (cb) {
    if (chat.isGroup()) {
      return notifyParticipants(chat, cb);
    }
    cb();
  };
}

function notifyParticipants(chat, cb) {
  var push = {
    message: 'You have been invited to the group: ' + chat.name,
    type: 'invitation'
  }
  var usernames = _.pluck(chat.participants, 'username');
  var users = UserCollection(usernames);
  users.notify(push, cb);
}


