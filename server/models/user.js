// External Modules
var async = require('async');
var assert = require('assert');
var url = require('url');
var _ = require('underscore');

// Internal Modules
var db = require('../util/db');
var HttpError = require('../util/http-error.js');
var Mailer = require('./mailer.js');
var usernameToJID = require('../util/usernameToJID.js');

var tablePasswordReset = {
  table: 'password_reset',
  columns: {
    username: 'username',
    passwordKey: 'password_key' // jshint: ignore line
  }
};

var tableUsers = {
  table: 'users',
  columns: {
    username: 'username',
    password: 'password',
    'created_at': 'created_at'
  }
};

var tableSession = {
  table: 'session',
  columns: {
    username: 'username',
    sessionID: 'session_key'
  }
};

/*var tableUsernamePhoneEmail = {
  table: 'username_phone_email',
  columns: {
    username: 'username',
    ccode: 'ccode',
    phone: 'phone',
    email: 'email'
  }
};*/

function User(data) {
  data = data || {};
  this.username = data.username;
  this.password = data.password;
  this.sessionID = data.sessionID;
  this.passwordKey = data.passwordKey;
  this.email = data.email;
}

User.prototype.insert = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.password, 'Expected password parameter to be set');
  var query = 'INSERT INTO ?? (??) VALUES (?)';
  var data = [
    tableUsers.table,
    [tableUsers.columns.username, tableUsers.columns.password],
    [this.username, this.password]
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.insertInfo = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.email, 'Expected email to be set');
  var query = 'INSERT INTO username_phone_email (username, email) VALUES (?)';
  var data = [[this.username, this.email]];
  db.queryWithData(query, data, cb);
};

User.prototype.loadFromEmail = function(cb) {
  assert.ok(this.email, 'Expected email to be set');
  var query = 'SELECT username FROM username_phone_email WHERE email = ?';
  var data = [this.email];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    if (rows.length === 0) {
      return cb(null, null);
    }
    self.username = rows[0].username;
    cb(null, self.username);
  });
};

User.prototype.insertSession = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.sessionID, 'Expected session id to be set');
  var query = 'INSERT INTO ?? (??) VALUES (?)';
  var data = [
    tableSession.table,
    [tableSession.columns.username, tableSession.columns.sessionID],
    [this.username, this.sessionID]
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.insertPasswordKey = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.passwordKey, 'Expected password key to be set');
  var query = 'INSERT INTO ?? (??) VALUES (?)';
  var data = [
    tablePasswordReset.table,
    [tablePasswordReset.columns.username, tablePasswordReset.columns.passwordKey],
    [this.username, this.passwordKey]
  ];
  db.queryWithData(query, data, function(err, rows) {
    cb(err, rows);
  });
};

User.prototype.update = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.password, 'Expected password to be set');
  var query = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
  var data = [
    tableUsers.table,
    tableUsers.columns.password,
    this.password,
    tableUsers.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.updateSession = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.sessionID, 'Expected session id to be set');
  var query = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
  var data = [
    tableSession.table,
    tableSession.columns.username,
    this.username,
    tableSession.columns.sessionID,
    this.sessionID
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.delete = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  var query = 'DELETE FROM ?? WHERE ?? = ?';
  var data = [
    tableUsers.table,
    tableUsers.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.deleteSession = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  var query = 'DELETE FROM ?? WHERE ?? = ?';
  var data =[
    tableSession.table,
    tableSession.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.deletePasswordKey = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.passwordKey, 'Expected password key to be set');
  var query = 'DELETE FROM ?? WHERE ?? = ?';
  var data = [
    tablePasswordReset.table,
    tablePasswordReset.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.loadPasswordKey = function(cb) {
  assert.ok(this.email, 'Expected email to be set');
  var query = 'SELECT password_key FROM password_reset WHERE username = ' +
  '(SELECT username FROM username_phone_email WHERE email = ?)';
  var data = [
    this.email
  ];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    if (rows.length === 0) {
      return cb(new HttpError('No Valid Key Found'), 406);
    }
    self.passwordKey = rows[0]['password_key']; // jshint ignore:line
    cb(null, rows[0]);
  });
};

User.prototype.hasValidPasswordKey = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.passwordKey, 'Expected password key to be set');
  var query = 'SELECT * FROM ?? WHERE created_at > (NOW() - INTERVAL 1 DAY) && ?? = ? AND ?? = ?';
  var data = [
    tablePasswordReset.table,
    tablePasswordReset.columns.username,
    this.username,
    tablePasswordReset.columns.passwordKey,
    this.passwordKey
  ];

  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    cb(null, rows.length > 0);
  });
};

User.prototype.hasValidSessionID = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.sessionID, 'Expected session id to be set');
  var query = 'SELECT * FROM ?? WHERE ?? = ?';
  var data = [
    tableSession.table,
    tableSession.columns.username,
    this.username
  ];
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    cb(null, rows.length > 0);
  });
};

User.prototype._cleanUpAll = function(callback) {
  async.parallel([
    function(cb) {
      var query = 'DELETE FROM session';
      db.directQuery(query, cb);
    },
    function(cb) {
      var query = 'DELETE FROM password_reset';
      db.directQuery(query, cb);
    },
    function(cb) {
      var query = 'DELETE FROM users';
      db.directQuery(query, cb);
    },
    function(cb) {
      var query = 'DELETE FROM username_phone_email';
      db.directQuery(query, cb);
    }
  ], callback);
};

User.prototype.sendPasswordKeyEmail = function(cb) {
  var mailer = new Mailer();
  mailer.sendPasswordKeyEmail(this, cb);
};

User.prototype.getPasswordResetLink = function() {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.passwordKey, 'Expected password key to be set');
  return url.format({
    protocol: 'https:',
    host: 'versapp.co',
    pathname: '/password/forgot',
    query: {
      key: this.passwordKey,
      username: this.username
    }
  });
};

User.prototype.loadFriends = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  var query = "SELECT username FROM rosterusers WHERE jid = ?";
  var data = [usernameToJID(this.username)];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    self.friends = _.pluck(rows, 'username');
    cb(null, self.friends);
  });
};

User.prototype.loadSecondDegreeFriends = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.friends, 'Expected friends to be set');

  if (this.friends.length === 0) {
    this.secondDegreeFriends = [];
    return cb(null, []);
  }

  var friendJIDS = _.map(this.friends, function(username) {
    return usernameToJID(username);
  });

  var query = 'SELECT DISTINCT username, \'2\' AS connection ' +
  'FROM rosterusers ' +
  'WHERE jid IN (?) ' +
    'AND username NOT IN (?) ' +
    'AND username != ?';

  var data = [friendJIDS, this.friends, this.username];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(err);
    }
    self.secondDegreeFriends = _.pluck(rows, 'username');
    cb(null, self.secondDegreeFriends);
  });
};

module.exports = function(data) {
  return new User(data);
};