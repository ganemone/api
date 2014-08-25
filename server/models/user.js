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

function User(username, sessionID) {
  this.username = username;
  this.sessionID = sessionID;
}

User.prototype.insert = function(password, cb) {
  assert.ok(this.username, 'Expected username to be set');
  assert.ok(password, 'Expected password parameter to be set');
  cb = cb || function noop() {};
  var query = 'INSERT INTO ?? (??) VALUES (??)';
  var data = [
    tableUsers.table,
    [tableUsers.columns.username, tableUsers.columns.password],
    [this.username, password]
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.delete = function(cb) {
  assert.ok(this.username, 'Expected username to be set');
  cb = cb || function noop() {};
  var query = 'DELETE FROM ?? WHERE ?? = ?';
  var data = [
    tableUsers.table,
    tableUsers.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.hasValidResetPasswordKey = function(cb) {
  var query = 'SELECT * FROM ?? WHERE timestamp > (NOW() - INTERVAL 1 DAY) && ?? = ? AND ?? = ?';
  var data = [
    tablePasswordReset.table,
    tablePasswordReset.columns.username,
    this.username,
    tablePasswordReset.columns.key,
    this.sessionID
  ];

  db.queryWithData(query, data, function(err, rows, fields) {
    if (err) {
      cb(err);
    } else {
      cb(null, rows.length > 0);
    }
  });
};

User.prototype.updatePassword = function(password, cb) {
  cb = cb || function noop() {};
  var query = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
  var data = [
    tableUsers.table,
    tableUsers.columns.password,
    password,
    tableUsers.columns.username,
    this.username
  ];
  db.queryWithData(query, data, cb);
};

User.prototype.hasValidSessionID = function() {

};

module.exports = User;