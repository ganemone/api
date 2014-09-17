var assert = require('assert');
var db = require('../../../server/util/db.js');

describe('A database util', function () {
	it('should be able to query with data', function (done) {
		var query = 'SELECT * FROM users WHERE username = ?';
		var data = ['someusername'];			
    db.queryWithData(query, data, function(err, rows) {
      assert.ifError(err);
      assert.ok(rows);
      done();
    });
	});
	it('should be able to direct query', function (done) {
    var query = 'SELECT * FROM users';
    db.directQuery(query, function(err, rows) {
      assert.ifError(err);
      assert.ok(rows);
    });
	});
});
