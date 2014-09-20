var db = require('../../server/util/db.js');

module.exports = function (obj) {
  before(function (done) {
    var query = 'INSERT INTO participants (chat_id, username, status) VALUES (?)';
    var data = [[obj.chatID, obj.username, obj.status]];
    db.queryWithData(query, data, function(err, result) {
      done();
    });
  });
  after(function (done) {
    var query = 'DELETE FROM participants';
    db.directQuery(query, function(err, rows) {
      done();
    });
  });
}