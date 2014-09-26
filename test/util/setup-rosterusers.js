var db = require('../../server/util/db');
var usernameToJID = require('../../server/util/usernameToJID.js');

module.exports = function(username, friends, subscription) {
  subscription = subscription || 'B';
  before(function (done) {
    var query = "INSERT INTO rosterusers (username, jid, subscription, nick, ask, askmessage, server, subscribe, type) VALUES ?";
    var data = [];
    var jid = usernameToJID(username);
    for(var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      var friendJID = usernameToJID(friend);
      data.push([username, friendJID, subscription, '', 'N', '', 'N', '', 'item']);
      data.push([friend, jid, subscription, '', 'N', '', 'N', '', 'item']);
    }
    db.queryWithData(query, [data], function(err, rows) {
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
