var Chat = require('../../server/models/chat.js');
var db = require('../../server/util/db.js');

module.exports = function(chat) {
  chat = Chat(chat);
  before(function (done) {
    chat.insert(function(err, result) {
      if (chat.participants) {
        chat.insertParticipants(function(err, result) {
          done();
        });
      } else {
        done();
      }
    });
  });

  after(function (done) {
    var query = 'DELETE FROM chat; DELETE FROM participants;';
    db.directQuery(query, function() {
      done();
    });
  });
};