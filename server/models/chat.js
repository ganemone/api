var assert = require('assert');
var uuid = require('node-uuid');
var _ = require('underscore');
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var format = require('mysql').format;

function Chat(data) {
  if (typeof data === 'object') {
    this.id = data.id;
    this.type = data.type;
    this.owner = data.owner;
    this.cid = data.cid;
    this.participants = data.participants;
    this.degree = data.degree;
    this.name = data.name;
    this.uuid = data.uuid;
    this.user = data.user;
  } else {
    this.id = data;
  }
}

Chat.prototype.getParticipantsQuery = function() {
  this._assertHasID();
  var query = 'SELECT participants.username FROM participants WHERE chat_id = ?;';
  var data = [this.id];
  return format(query, data);
};

Chat.prototype.loadParticipants = function(cb) {
  var query = this.getParticipantsQuery();
  var self = this;
  db.directQuery(query, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to load participants', 500, err));
    }
    self.participants = _.pluck(rows, 'username');
    cb(null, rows.length > 0);
  });
};

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
  var query = 'INSERT INTO chat (uuid, type, owner_id, name, degree, cid) VALUES (?)';
  var data = [[this.uuid, this.type, this.owner, this.name, this.degree, this.cid]];
  var self = this;
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to insert chat', 500, err));
    }
    self.id = Number(result.insertId);
    cb(null, result);
  });
};

Chat.prototype.insertParticipants = function(cb) {
  this._assertHasOwner();
  this._assertHasID();
  this._assertHasParticipants();
  var query = 'INSERT INTO participants (chat_id, username, invited_by, status) VALUES ?';
  var data = [];
  var status = (this.type === 'group') ? 'pending' : 'active';
  for (var i = 0; i < this.participants.length; i++) {
    data.push([this.id, this.participants[i], this.owner, status]);
  }

  data.push([this.id, this.owner, this.owner, 'active']);

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

Chat.prototype.removeUser = function(user, cb) {
  this._assertHasUUID();
  var query = 'UPDATE participants SET status = ? WHERE username = ? AND chat_id = (SELECT id FROM chat WHERE uuid = ?)';
  var data = ['inactive', user.username, this.uuid];
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to remove user', 500, err));
    }
    cb(null, result.affectedRows === 1);
  });
};

Chat.prototype.joinUser = function(user, cb) {
  this._assertHasUUID();
  var query = 'UPDATE participants SET status = ? WHERE username = ? AND chat_id = (SELECT id FROM chat WHERE uuid = ?)';
  var data = ['active', user.username, this.uuid];
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to update participant status', 500, err));
    }
    cb(err, result.affectedRows === 1);
  });
};

Chat.prototype.toJSON = function() {
  var name = this.getName();
  var json = {
    uuid: this.uuid,
    name: name,
    type: this.type
  };
  if (this.type === 'thought') {
    json.degree = this.degree;
  }
  if (this.type === 'group') {
    json.participants = this.participants;
    json.owner = this.owner;
  }
  return json;
};

// TODO load the users actual name, instead of using the username
Chat.prototype.getName = function() {
  if (this.name) {
    return this.name;
  }
  this.name = (this.owner === this.user.username) ? this.participants[0] : 'Anonymous Friend';
  return this.name;
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

module.exports = function(data) {
  return new Chat(data);
};