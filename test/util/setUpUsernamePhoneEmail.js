var db = require('../../server/util/db.js');

module.exports = function(username, ccode, phone, email) {
  before(function (done) {
    var query = 'INSERT INTO username_phone_email (username, ccode, phone, email) VALUES (?)';
    var data = [[username, ccode, phone, email]];
    db.queryWithData(query, data, function(err, rows) {
      done();
    });
  });

  after(function (done) {
    var query = 'DELETE FROM username_phone_email';
    db.directQuery(query, function(err, result) {
      done();
    });
  });
};