var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var usernameToJID = require('../util/usernameToJID.js');

function Thought(data) {
  if (typeof data === 'object') {
    this.id = data.id;
    this.body = data.body;
    this.imageUrl = data.imageUrl;
    this.timestamp = data.timestamp;
    this.username = data.username;
    this.numFavorites = data.numFavorites;
    this.hasFavorited = data.hasFavorited;
    this.degree = data.degree;
  } else {
    this.id = data;
  }
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
      self.imageUrl = rows[0]['image_url']; // jshint ignore:line
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
  var self = this;
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to get degree from user', 500, err));
    }
    self.degree = (result[0].count > 0) ? 1 : 2;
    cb(null, self.degree);
  });
};

Thought.prototype.getFavoriteInfo = function(degree, cb) {
  var query = 'SELECT ' +
    'CASE ' +
      'WHEN FIND_IN_SET(?, GROUP_CONCAT(confession_favorites.jid SEPARATOR \',\')) > 0 ' +
      'THEN \'true\' ' +
      'ELSE \'false\' ' +
      'END ' +
    'AS hasFavorited, ' +
    'count(confession_favorites.jid) AS numFavorites, ' +
  'FROM confessions ' +
  'LEFT JOIN confession_favorites ' +
  'ON confessions.confession_id = confession_favorites.confession_id ' +
  'WHERE confessions.confession_id = ?';
  var data = [this.username, this.id];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to get thought favorite info', 500, err));
    }
    self.hasFavorited = rows[0].hasFavorited;
    self.numFavorites = rows[0].numFavorites;
    cb(null);
  });
};

Thought.prototype.toJSON = function() {
  return {
    id: Number(this.id),
    degree: Number(this.degree),
    body: this.body,
    timestamp: Number(this.timestamp),
    imageUrl: this.imageUrl,
    numFavorites: Number(this.numFavorites),
    hasFavorited: (this.hasFavorited === 'true')
  };
};

module.exports = function(data) {
  return new Thought(data);
};
