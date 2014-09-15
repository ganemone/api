var assert = require('assert');
var setUpUser =  require('../../util/setup-user.js');
var AuthEmail = require('../../../server/middlewares/auth-email.js');

describe('An auth email middleware', function () {
  
  it('should reject requests without an email parameter', function (done) {
    var mockReq = {
      params: {}
    };
    var mockRes = {
      locals: {}
    };
    var mockNext = function(err) {
      assert.ok(err, "Should return an error");
      done();
    };
    AuthEmail(mockReq, mockRes, mockNext);
  });

  it('should end the request if the user is not found', function (done) {
    var mockReq = {
      params: {
        email: 'nonexistingemail@gmail.com'
      }
    };
    var mockRes = {
      locals: {},
      end: function() {
        done();
      }
    };
    var mockNext = function(err) {
      assert.ifError(err, 'An error occurred');
      assert.fail('Mock Next Called', 'Mock next not to be called');
    };
    AuthEmail(mockReq, mockRes, mockNext);
  });

  describe('when receiving valid requests', function () {
    setUpUser({
      username: 'username',
      password: 'password',
      sessionID: 'session',
      email: 'username@gmail.com'
    });
    it('should accept valid requests', function (done) {
      var mockReq = {
        params: {
          email: 'username@gmail.com'
        }
      };
      var mockRes = {
        locals: {},
      };
      var mockNext = function(err) {
        assert.ifError(err, ' Should execute without error');
        assert.ok(mockRes.locals.user, 'User should be set on locals');
        done();  
      };
      AuthEmail(mockReq, mockRes, mockNext);
    });
  });
});