
// Endpoint: /friends
// Method: GET
// Authorization: Basic
// Parameters: None
// Action: Returns a json object representing
// the users friends lists. Example return:
// [{
//    username: <username>
//    name: name
// }, ...]
exports.index = function (req, res, next) {
  var user = res.locals.user;
  res.json(user.friends);
};