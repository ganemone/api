var assert = require('assert');
var rewire = require('rewire');
var blacklist = rewire('../../../server/controllers/blacklist');
var Mock = require('../../util/mock.js');

var mockReq = {
  body: {
    phones: ['12345'],
    emails: ['a@email.com']
  }
};

describe('Blacklist Controller', function () {
  describe('when friends are found', function () {
    it('should work', function (done) {
      var mockMakeRequest = new Mock(function(cb) {
        assert.equal(typeof cb, 'function');
        cb(null, true);
      });

      var mockNext = new Mock(function(err) {
        assert.ifError(err);
        assert.fail('Mock next called', 'Mock next not to be called');
        done();
      });

      var mockHasMadeRequest = new Mock(function(cb) {
        cb(null, false);
      });

      var mockBlist = new Mock(function(user, phones, emails) {
        assert.equal(user.username, 'username');
        assert.deepEqual(phones, mockReq.body.phones);
        assert.deepEqual(emails, mockReq.body.emails);
        return {
          hasMadeRequest: mockHasMadeRequest.getFn(),
          makeRequest: mockMakeRequest.getFn()
        };
      });

      var mockGet = new Mock(function(url, cb) {
        assert.equal(url, 'http://localhost:5290/notify/blm/username');
        assert.equal(typeof cb, 'function');
        cb(null, {
          statusCode: 200
        });
      });

      var mockEnd = new Mock(function() {
        assert.equal(arguments.length, 0);
        mockHasMadeRequest.assertCalled();
        mockBlist.assertCalled();
        mockMakeRequest.assertCalled();
        mockNext.assertNotCalled();
        mockGet.assertCalled();
        done();
      });

      var mockRes = {
        locals: {
          user: {
            username: 'username'
          }
        },
        end: mockEnd.getFn()
      };

      blacklist.__set__({
        'Blacklist': mockBlist.getFn(),
        'request': {
          get: mockGet.getFn()
        }
      });
      blacklist.index(mockReq, mockRes, mockNext.getFn());
    });
  });
  describe('when friends are not found', function() {
    it('should work', function (done) {
      var mockMakeRequest = new Mock(function(cb) {
        assert.equal(typeof cb, 'function');
        cb(null, false);
      });

      var mockNext = new Mock(function(err) {
        assert.ifError(err);
        assert.fail('Mock next called', 'Mock next not to be called');
        done();
      });

      var mockEnd = new Mock(function() {
        assert.equal(arguments.length, 0);
        done();
      });

      var mockRes = {
        locals: {
          user: {
            username: 'username'
          }
        },
        end: mockEnd.getFn()
      };

      var mockHasMadeRequest = new Mock(function(cb) {
        cb(null, false);
      });

      var mockBlist = new Mock(function(user, phones, emails) {
        assert.equal(user.username, 'username');
        assert.deepEqual(phones, mockReq.body.phones);
        assert.deepEqual(emails, mockReq.body.emails);
        return {
          hasMadeRequest: mockHasMadeRequest.getFn(),
          makeRequest: mockMakeRequest.getFn()
        };
      });

      blacklist.__set__({
        'Blacklist': mockBlist.getFn(),
        'request': {
          get: function() {
            assert.fail('Request.get Called', 'Expected request.get not to be called');
          }
        }
      });
      blacklist.index(mockReq, mockRes, mockNext.getFn());
    });
  });
});