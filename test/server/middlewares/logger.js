var assert = require('assert');
var logger = require('../../../server/middlewares/logger.js');

describe('A logger', function() {
  
  it('should log requests', function (done) {
    var mockReq = {
      path: 'somepath'
    };
    var mockNext = function(err) {
      assert.ifError(err, 'Should execute without error');
      done();
    }
    logger(mockReq, {}, mockNext);
  });
});