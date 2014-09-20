var assert = require('assert');
var uuid = require('node-uuid');
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');

function Chat(data) {
  if (typeof data === 'object') {
    this.id = data.id;
    this.type = data.type;
    this.owner = data.owner;
    this.participants = data.participants;
    this.degree = data.degree;
    this.name = data.name;
  } else {
    this.id = data;
  }
}

Chat.prototype.load = function(cb) {
  this._assertHasID();
  var query = 'SELECT chat.uuid, chat.type, chat.owner_id, UNIX_TIMESTAMP(chat.created) AS created, degree FROM chat WHERE chat.id = ?';
  var data = [this.id];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to load chat', 500, err));
    }
    if (rows.length === 0) {
      return cb(null, false);
    }
    var chatRows = rows[0];
    self.uuid = chatRows.uuid;
    self.type = chatRows.type;
    self.owner = chatRows.owner_id; // jshint ignore: line
    self.created = chatRows.created;
    self.degree= chatRows.degree;
    cb(null, true);
  });
};

Chat.prototype.loadFromUUID = function(cb) {
  this._assertHasUUID();
  var query = 'SELECT chat.id, chat.type, chat.owner_id, UNIX_TIMESTAMP(chat.created) AS created, degree FROM chat WHERE chat.uuid = ?';
  var data = [this.uuid];
  var self = this;
  db.queryWithData(query, data, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to load chat', 500, err));
    }
    if (rows.length === 0) {
      return cb(null, false);
    }
    var chatRows = rows[0];
    self.id = chatRows.uuid;
    self.type = chatRows.type;
    self.owner = chatRows.owner_id; // jshint ignore: line
    self.created = chatRows.created;
    self.degree= chatRows.degree;
    cb(null, true);
  });
};

Chat.prototype.insert = function(cb) {
  this.uuid = uuid.v4();
  this._assertHasType();
  this._assertHasOwner();
  this._assertHasName();
  this._assertHasDegree();
  var query = 'INSERT INTO chat (uuid, type, owner_id, name, degree) VALUES (?)';
  var data = [[this.uuid, this.type, this.owner, this.name, this.degree]];
  var self = this;
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to insert chat', 500, err));
    }
    self.id = Number(result.insertId);
    cb(null, self);
  });
};

Chat.prototype.insertParticipants = function(cb) {
  this._assertHasOwner();
  this._assertHasName();
  this._assertHasID();
  this._assertHasParticipants();
  var query = 'INSERT INTO participants (chat_id, username, invited_by, status) VALUES ?';
  var data = [];
  for (var i = 0; i < this.participants.length; i++) {
    var tmpArr = [];
    tmpArr.push(this.id);
    tmpArr.push(this.participants[i]);
    tmpArr.push(this.owner);
    tmpArr.push('inactive');
    data.push(tmpArr);
  }

  db.queryWithData(query, [data], function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to insert participants', 500, err));
    }
    cb(null, result);
  });
};

Chat.prototype.deleteFromID = function(cb) {
  this._assertHasID();
  var query = 'DELETE FROM chat WHERE id = ?';
  var data = [this.id];
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to delete chat', 500, err));
    }
    cb(null, result.affectedRows > 0);
  });
};

Chat.prototype.deleteFromUUID = function(cb) {
  this._assertHasUUID();
  var query = 'DELETE FROM chat WHERE uuid = ?';
  var data = [this.uuid];
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to delete chat', 500, err));
    }
    cb(null, result.affectedRows > 0);
  });
};

Chat.prototype._assertHasID = function() {
  assert.equal(typeof this.id, 'number', 'Expected id to be set');
};

Chat.prototype._assertHasUUID = function() {
  assert.ok(this.uuid, 'Expected uuid to be set');
};

Chat.prototype._assertHasDegree = function() {
  assert.ok(this.degree, 'Expected degree to be set');
};

Chat.prototype._assertHasOwner = function() {
  assert.ok(this.owner, 'Expected owner to be set');
};

Chat.prototype._assertHasName = function() {
  assert.ok(this.name, 'Expected name to be set');
};

Chat.prototype._assertHasParticipants = function() {
  assert.ok(this.participants, 'Expected participants to be set');
};

Chat.prototype._assertHasType = function() {
  assert.ok(this.type, 'Expected type to be set');
};

module.exports = function(id, type, owner, participants) {
  return new Chat(id, type, owner, participants);
};