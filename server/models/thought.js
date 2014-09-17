var db = require('../util/db.js');

function Thought(cid) {
  this.id = cid;
}

Thought.prototype.load = function(cb) {
  var query = 'SELECT * FROM confessions WHERE id = ?';
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
}

module.exports = Thought;
