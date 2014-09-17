var db = require('../util/db.js');

function Chat(id, type, participants) {
  this.id = id;
  this.type = type;
  this.participants = participants;
}

Chat.prototype.insert = function(cb) {
  var query = 'INSERT INTO chat (id, jid, body, image_url) VALUES (?)';
  //var data = [this.id, this.]
};

module.exports = Chat;