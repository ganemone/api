var db = require('../../server/util/db.js');

module.exports = function(chat, participants) {
  before(function (done) {
    var query = 'INSERT INTO chat (id, type, owner_id, name, degree, uuid) VALUES (?)';
    var data = [[chat.id, chat.type, chat.owner, chat.name, chat.degree, chat.uuid]];
    
    db.queryWithData(query, data, function(err, result) {
      done();
    });
  });

  after(function (done) {
    var query = 'DELETE FROM chat';
    db.directQuery(query, function() {
      done();
    });
  });
};