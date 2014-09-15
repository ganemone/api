var assert = require('assert');
var ValidatePassword = require('../../../server/middlewares/validate-password.js');

describe('Validate Password middleware', function () {
  
  it('should reject requests without parameters', function (done) {
    var mockReq = {
      query: {}
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ok(err, 'Return an error');
      assert.ifError(mockRes.locals.user.password, 'Should not set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });

  it('should reject requests without a confirm parameter', function (done) {
    var mockReq = {
      query: {
        password: 'somepassword'
      }
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ok(err, 'Return an error');
      assert.ifError(mockRes.locals.user.password, 'Should not set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });

  it('should reject requests without a password parameter', function (done) {
    var mockReq = {
      query: {
        confirm: 'somepassword'
      }
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ok(err, 'Return an error');
      assert.ifError(mockRes.locals.user.password, 'Should not set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });

  it('should reject requests with mis matching passwords', function (done) {
    var mockReq = {
      query: {
        password: 'somepassword',
        confirm: 'anotherpassword'
      }
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ok(err, 'Return an error');
      assert.ifError(mockRes.locals.user.password, 'Should not set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });

  it('should reject requests with short passwords', function (done) {
      var mockReq = {
      query: {
        password: 'pwd',
        confirm: 'pwd'
      }
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ok(err, 'Return an error');
      assert.ifError(mockRes.locals.user.password, 'Should not set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });

  it('should accept valid requests', function (done) {
    var mockReq = {
      query: {
        password: 'validpassword',
        confirm: 'validpassword'
      }
    };
    var mockRes = {
      locals: {
        user: {}
      }
    };
    var mockNext = function(err) {
      assert.ifError(err, 'Should execute without error');
      assert.equal(mockRes.locals.user.password, 'validpassword', 'Should set the users password');
      done();
    }
    ValidatePassword(mockReq, mockRes, mockNext);
  });
});