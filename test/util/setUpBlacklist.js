var db = require('../../server/util/db.js');

module.exports = function(username) {
  before(function (done) {
    var query = 'INSERT INTO blacklist (username) VALUES (?)';
    var data = [username];
    db.queryWithData(query, data, function(err, rows) {
      done();
    });    
  });

  after(function (done) {
    var query = 'DELETE FROM blacklist';
    db.directQuery(query, function(err, result) {
      done();
    });
  });
}