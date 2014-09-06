var async = require('async');
var assert = require('assert');
var db = require('../util/db');

var tablePasswordReset = {
  table: 'password_reset',
  columns: {
    username: 'username',
    key: 'key'
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

var tableUsernamePhoneEmail = {
  table: 'username_phone_email',
  columns: {
    username: 'username',
    ccode: 'ccode',
    phone: 'phone',
    email: 'email'
  }
}

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
  db.queryWithData(query, data);
};

User.prototype.loadFromEmail = function(cb) {
  assert.ok(this.email, 'Expected email to be set');
  var query = 'SELECT username FROM username_phone_email WHERE email = ?';
  var data = [this.email];
  db.queryWithData(query, function(err, rows, fields) {
    if (err) {
      return cb(err);
    }
    if (rows.length === 0) {
      return cb(new HttpError('User not found', 406));
    };
  })
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
    [tablePasswordReset.columns.username, tablePasswordReset.columns.key],
    [this.username, this.passwordKey]
  ];
  db.queryWithData(query, data, cb);
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

User.prototype.loadPasswordKey = function() {
  assert.ok(this.email, 'Expected email to be set');
  var query = '
  SELECT key FROM password_reset 
  WHERE username = (
    SELECT username 
    FROM username_phone_email 
    WHERE email = ?
  )';
  var data = [
    this.email
  ];
  db.queryWithData(query, data, function(err, rows, fields) {
    if (err) {
      return cb(err);
    }
    if (rows.length === 0) {
      return cb(new HttpError('No Valid Key Found'), 406);
    }
    cb(null, rows[0]);
  });
};

User.prototype.hasValidResetPasswordKey = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(this.passwordKey, 'Expected password key to be set');
  var query = 'SELECT * FROM ?? WHERE timestamp > (NOW() - INTERVAL 1 DAY) && ?? = ? AND ?? = ?';
  var data = [
    tablePasswordReset.table,
    tablePasswordReset.columns.username,
    this.username,
    tablePasswordReset.columns.key,
    this.passwordKey
  ];

  db.queryWithData(query, data, function(err, rows, fields) {
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
  db.queryWithData(query, data, function(err, rows, fields) {
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
  ], callback);
};

module.exports = User;
