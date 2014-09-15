var assert = require('assert');
var setUpUser = require('../../util/setup-user.js');
var AuthPasswordKey = require('../../../server/middlewares/auth-password-key.js');

describe('An Auth Password Key middleware', function () {
  
  setUpUser({
    username: 'username',
    password: 'password',
    passwordKey: 'key' 
  });

  it('should reject requests with no parameters', function (done) {
    var mockReq = {
      query: {}
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ok(err, 'Should throw an error');
      assert.ifError(mockRes.locals.user, 'Should not set the user object on res.locals');
      done();
    }
    AuthPasswordKey(mockReq, mockRes, mockNext);
  });

  it('should reject requests without a username parameter', function (done) {
    var mockReq = {
      query: {
        key: 'key'
      }
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ok(err, 'Should throw an error');
      assert.ifError(mockRes.locals.user, 'Should not set the user object on res.locals');
      done();
    }
    AuthPasswordKey(mockReq, mockRes, mockNext);
  });

  it('should reject requets without a key parameter', function (done) {
    var mockReq = {
      query: {
        username: 'username'
      }
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ok(err, 'Should throw an error');
      assert.ifError(mockRes.locals.user, 'Should not set the user object on res.locals');
      done();
    }
    AuthPasswordKey(mockReq, mockRes, mockNext);
  });

  it('should reject invalid requests', function (done) {
    var mockReq = {
      query: {
        username: 'invalid',
        key: 'invalid'
      }
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ok(err, 'Should throw an error');
      assert.ifError(mockRes.locals.user, 'Should not set the user object on res.locals');
      done();
    }
    AuthPasswordKey(mockReq, mockRes, mockNext);
  });

  it('should accept valid requests', function (done) {
    var mockReq = {
      query: {
        username: 'username',
        key: 'key'
      }
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ifError(err, 'Should execute without error');
      assert.ok(mockRes.locals.user, 'Should set the user object on res.locals');
      done();
    }
    AuthPasswordKey(mockReq, mockRes, mockNext);
  }); 
});

