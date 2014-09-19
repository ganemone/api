var assert = require('assert');
var rewire = require('rewire');
var Mock = require('../../util/mock.js');
var ValidateBlacklist = rewire('../../../server/middlewares/validate-blacklist.js');

describe('ValidateBlacklist middleware', function () {
  it('should accept valid requests', function (done) {
    testValidateBlacklist(['12345'], ['12345'], true, false, done);
  });
  it('should reject requests without a phones parameter', function (done) {
    testValidateBlacklist(null, ['12345'], false, false, done);
  });
  it('should reject requests without a emails parameter', function (done) {
    testValidateBlacklist(['12345'], null, false, false, done);
  });
  it('should reject empty requests', function (done) {
    testValidateBlacklist(null, null, false, false, done);
  });
  it('should end empty requests', function (done) {
    testValidateBlacklist([], [], false, true, done);
  });
});

function testValidateBlacklist(phones, emails, valid, shouldEnd, done) { // jshint ignore: line
  var mockNext = new Mock(function(err) {
    if (valid) {
      assert.ifError(err);
    } else {
      assert.ok(err);
    }
  });

  var mockEnd = new Mock(function() {
    assert.equal(arguments.length, 0);
  });

  var mockReq = {
    body: {
      phones: phones,
      emails: emails
    }
  };

  var mockRes = {
    end: mockEnd.getFn()
  };

  ValidateBlacklist(mockReq, mockRes, mockNext.getFn());

  if (shouldEnd) {
    mockEnd.assertCalled();
    mockNext.assertNotCalled();
  } else {
    mockEnd.assertNotCalled();
    mockNext.assertCalled();
  }
  done();
}