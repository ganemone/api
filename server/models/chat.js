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
  assert.equal(typeof this.id, 'number', 'Expected id to be set');
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

Chat.prototype.insert = function(cb) {
  this.uuid = uuid.v4();
  assert.ok(this.type, 'Expected type to be set');
  assert.ok(this.owner, 'Expected owner to be set');
  assert.ok(this.name, 'Expected name to be set');
  assert.ok(this.degree, 'Expected degree to be set');
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
  assert.ok(this.owner, 'Expected owner to be set');
  assert.ok(this.name, 'Expected name to be set');
  assert.equal(typeof this.id, 'number', 'Expected id to be set');
  assert.ok(this.participants, 'Expected participants to be set');
  var query = 'INSERT INTO participants (chat_id, username, invited_by, status)';
  var dataArr = [];
  for (var i = 0; i < this.participants.length; i++) {
    dataArr.push(this.id);
    dataArr.push(this.participants[i]);
    dataArr.push(this.owner);
    dataArr.push('inactive');
  }
  var data = [dataArr];
  db.queryWithData(query, data, function(err, result) {
    if(err) {
      return cb(new HttpError('Failed to insert participants', 500, err));
    }
    cb(null, result);
  });
};

module.exports = function(id, type, owner, participants) {
  return new Chat(id, type, owner, participants);
};