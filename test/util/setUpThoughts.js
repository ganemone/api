var db = require('../../server/util/db.js');

module.exports = function(username)  {

  before(function (done) {
    var query = 'INSERT INTO confessions (`jid`, `body`, `image_url`) VALUES (?)';
    var data = [[username, 'some+thought', 'someurl']];
    var self = this;
    db.queryWithData(query, data, function(err, result) {
      self.cid = result.insertId;
      done();
    });
  });

  after(function (done) {
    var query = 'DELETE FROM confessions';
    db.directQuery(query, function() {
      done();
    });
  });
};

