var db = require('../db/index');
// Endpoint: /friends/active
// Method: GET
// Authorization: Basic
// Parameters: None
// Middlewares:
//    - AuthUser
//    - LoadFriends.first
//    - LoadNames.active
// Action: Returns a json object representing
// the users friends lists. Example return:
// [{
//    username: <username>
//    name: name
// }, ...]
exports.active = function(req, res, next) {
  res.json(res.locals.activeFriends);
};

// Endpoint: /friends/pending
// Method: GET
// Authorization: Basic
// Parameters: None
// Middlewares:
//    - AuthUser
//    - LoadFriends.first
//    - LoadNames.pending
// Action: Returns a json object representing
// the users pending friends. Example return:
// [{
//    username: <username>
//    name: name
// }, ...]
exports.pending = function(req, res, next) {
  res.json(res.locals.pendingFriends);
};

exports.getFriends = function(req, res, next) {
  var user = res.locals.user;
  return makePromiseCall(user.getActiveFriends(), res, next);
};

exports.getPendingFriends = function(req, res, next) {
  var user = res.locals.user;
  return makePromiseCall(user.getPendingFriends(), res, next);
};

exports.getRequestedFriends = function(req, res, next) {
  var user = res.locals.user;
  return makePromiseCall(user.getRequestedFriends(), res, next);
};

exports.getWasRejectedFriends = function(req, res, next) {
  var user = res.locals.user;
  return makePromiseCall(user.getWasRejectedFriends(), res, next);
};

exports.getDidRejectFriends = function(req, res, next) {
  var user = res.locals.user;
  return makePromiseCall(user.getDidRejectFriends(), res, next);
};

exports.request = function(req, res, next) {
  return setFriendStatus(req, res, next, db.Friend.makePendingFriends);
};

exports.accept = function(req, res, next) {
  return setFriendStatus(req, res, next, db.Friend.makeFriends);
};

exports.deny = function(req, res, next) {
  return setFriendStatus(req, res, next, db.Friend.makeDidRejectFriends);
};

function setFriendStatus(req, res, next, action) {
  var user = res.locals.user;
  var userUsername = user.getDataValue('username');
  var friendUsername = req.params.username;
  return makePromiseCall(
    action(userUsername, friendUsername),
    res,
    next
  );
}

function makePromiseCall(promise, res, next) {
  return promise
    .then(function(result) {
      console.log("Result: ", result);
      res.json(result);
      return result;
    })
    .catch(function(error) {
      next(error);
      return false;
    });
}