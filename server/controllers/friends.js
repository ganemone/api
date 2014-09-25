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
exports.active = function (req, res, next) {
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
exports.pending = function (req, res, next) {
  res.json(res.locals.pendingFriends);
};