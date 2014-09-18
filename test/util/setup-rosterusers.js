var db = require('../../server/util/db');
var usernameToJID = require('../../server/util/usernameToJID.js');

module.exports = function(username, friends) {

  before(function (done) {
    var query = "INSERT INTO rosterusers (username, jid) VALUES ";
    var data = [];
    var jid = usernameToJID(username);
    for(var i = 0; i < friends.length - 1; i++) {
      var friend = friends[i];
      var friendJID = usernameToJID(friend);
      query += "(?, ?), (?, ?), ";
      data.push(username);
      data.push(friendJID);

      data.push(friend);
      data.push(jid);
    }
    var lastFriend = friends[friends.length - 1];
    var lastFriendJID = usernameToJID(lastFriend);
    query += "(?, ?), (?, ?)";
    data.push(username);
    data.push(lastFriendJID);

    data.push(lastFriend);
    data.push(jid);

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
