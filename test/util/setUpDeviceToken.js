var cleanUpTable = require('./cleanUpTable.js');
var db = require('../../server/util/db.js');

module.exports = function(username, token, type) {
  before(function (done) {
    var query = 'INSERT INTO device_tokens (username, token, type) VALUES (?)';
    var data = [[username, token, type]];
    db.queryWithData(query, data, function(err, rows) {
      done();
    });
  });
  cleanUpTable('device_tokens');
}