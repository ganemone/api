var assert = require('assert');
var message = require('../../../server/middlewares/message.js');

describe('A messsage middleware', function () {

  it('should set res.locals.message if passed as a query parameter', function (done) {
    var mockReq = {
      query: {
        message: 'message'
      }
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ifError(err, 'Should execute without error');
      assert.equal(mockRes.locals.message, 'message', 'Should set res.locals.message correctly');
      done();
    };
    message(mockReq, mockRes, mockNext);
  });

  it('should not set res.locals.message if not passed as a query parameter', function (done) {
    var mockReq = {
      query: {}
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ifError(err, 'Should execute without error');
      assert.ifError(mockRes.locals.message, 'Should not set mockRes.locals.message');
      done();
    };
    message(mockReq, mockRes, mockNext);
  });

});