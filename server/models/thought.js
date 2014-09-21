var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var usernameToJID = require('../util/usernameToJID.js');

function Thought(cid) {
  this.id = cid;
}

Thought.prototype.load = function(cb) {
  var query = 'SELECT * FROM confessions WHERE confession_id = ?';
  var data = [this.id];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to load thought', 500, err));
    }
    if (rows.length > 0) {
      self.body = rows[0].body;
      self.imageURL = rows[0]['image_url']; // jshint ignore:line
      self.timestamp = rows[0]['created_timestamp']; // jshint ignore:line
      self.username = rows[0].jid;
      return cb(null, true);
    }
    cb(null, false);
  });
};

Thought.prototype.getDegreeFromUser = function(username, cb) {
  var query = 'SELECT count(*) AS count FROM rosterusers WHERE jid = ? AND username = ?;';
  var jid = usernameToJID(this.username);
  var data = [jid, username];
  if (username === this.username) {
    cb(null, 0);
  }
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to get degree from user', 500, err));
    }
    var degree = (result[0].count > 0)
      ? 1
      : 2;
    cb(null, degree);
  });
};

module.exports = Thought;
