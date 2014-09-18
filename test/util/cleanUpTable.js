var db = require('../../server/util/db.js');

module.exports = function(table) {
  after(function (done) {
    db.queryWithData('DELETE FROM ??', [table], function(err, rows) {
      if (err) {
        console.error('Failed to clean up table', err);
      }
      done();
    });
  });
};