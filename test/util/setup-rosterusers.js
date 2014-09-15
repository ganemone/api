var db = require('../../server/util/db');
var config = require('../../config/index.js');

module.exports = function(username, friends) {

  before(function (done) {
    var query = "INSERT INTO rosterusers (username, jid) VALUES ";
    var data = [];
    var jid = username + "@" + config.ip;
    for(var i = 0; i < friends.length - 1; i++) {
      var friend = friends[i];
      var friendJID = friend + "@" + config.ip;
      query += "(?, ?), (?, ?), ";
      data.push(username);
      data.push(friendJID);
      data.push(jid);
      data.push(friend);
    }
    var lastFriend = friends[friends.length - 1];
    var lastFriendJID = lastFriend + '@' + config.ip;
    query += "(?, ?), (?, ?)";
    data.push(username);
    data.push(lastFriendJID);
    data.push(jid);
    data.push(lastFriend);
    db.queryWithData(query, data, function(err, rows, fields) {
      done();
    });
  });

  after(function (done) {
    var query = 'DELETE FROM rosterusers';
    db.directQuery(query, function() {
      done();
    });
  });
};
