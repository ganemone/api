var assert = require('assert');
var rewire = require('rewire');
var AuthUser = rewire('../../../server/middlewares/auth-user.js');
var Mock = require('../../util/mock.js');

describe('AuthUser Middleware', function () {
  it('should work with valid requests', function (done) {
    testAuthUser(true, done);
  });
  it('should return an error for invalid requests', function (done) {
    testAuthUser(false, done);
  });
  it('should handle errors', function (done) {
    testAuthUser(null, done, new Error('Something bad happened'));
  });
});

function testAuthUser(valid, done, error) {
  var mockUser = new Mock(function(data) {
    return {
      hasValidSessionID: function(cb) {
        cb(error, valid);
      }
    };
  });
  AuthUser.__set__({
    'BasicAuth': function() {
      return {
        name: 'name',
        pass: 'pass'
      };
    },
    'User': mockUser.getFn()
  });

  var mockRes = {
    locals: {}
  };

  var mockNext = function(err) {
    if (error) {
      assert.deepEqual(err, error);
    }
    if (valid) {
      assert.ifError(err);
      assert.ok(mockRes.locals.user);
    } else {
      assert.ok(err);
      assert.ifError(mockRes.locals.user);
    }
    mockUser.assertCalledOnceWith({
      username: 'name',
      sessionID: 'pass'
    });
    done();
  };
  AuthUser({}, mockRes, mockNext);
}