// External Modules
var assert = require('assert');
var rewire = require('rewire');
// Internal Modules
var chat = rewire('../../../server/controllers/chat.js');
var Mock = require('../../util/mock.js');

describe('A Chat Controller\'s', function () {
  describe('create method applied to', function () {
    describe('a one to one', function () {
      it('should work', function (done) {
        testCreate('121', done);
      });
      it('should handle errors', function (done) {
        testCreate('121', done);
      });
    });
    describe('a thought', function () {
      it('should work', function (done) {
        testCreate('thought', done);
      });
      it('should handle errors', function (done) {
        testCreate('thought', done);
      });
    });
    describe('a group', function () {
      it('should work', function (done) {
        testCreate('group', done);
      });
      it('should handle errors', function (done) {
        testCreate('group', done);
      });
    });
  });
  describe('leave method', function () {
    it('should work', function (done) {
      var mockRemoveUser = getMockWithCB(['object', 'function'], null, true);
      var mockNext = new Mock(function noop() {});
      var mockJSON = getMockWithDone([], [mockRemoveUser], [mockNext], done);
      var mockRes = {
        locals: {
          user: {},
          chat: {
            removeUser: mockRemoveUser.getFn()
          }
        },
        json: mockJSON.getFn()
      };
      chat.leave({}, mockRes, mockNext.getFn());
    });
    it('should handle errors', function (done) {
      var mockRemoveUser = getMockWithCB(['object', 'function'], new Error('Some error'));
      var mockJSON = new Mock(function noop() {});
      var mockNext = getMockWithDone(['object'], [mockRemoveUser], [mockJSON], done);

      var mockRes = {
        locals: {
          user: {},
          chat: {
            removeUser: mockRemoveUser.getFn()
          }
        },
        json: mockJSON.getFn()
      };
      chat.leave({}, mockRes, mockNext.getFn());
    });
  });
  describe('join method', function () {
    it('should work', function (done) {
      var mockJoinUser = getMockWithCB(['object', 'function'], null, true);
      var mockNext = new Mock(function noop() {});
      var mockJSON = getMockWithDone([], [mockJoinUser], [mockNext], done);
      var mockRes = {
        locals: {
          user: {},
          chat: {
            joinUser: mockJoinUser.getFn()
          }
        },
        json: mockJSON.getFn()
      };
      chat.join({}, mockRes, mockNext.getFn());
    });
    it('should handle errors', function (done) {
      var mockJoinUser = getMockWithCB(['object', 'function'], new Error('Some error'));
      var mockJSON = new Mock(function noop() {});
      var mockNext = getMockWithDone(['object'], [mockJoinUser], [mockJSON], done);

      var mockRes = {
        locals: {
          user: {},
          chat: {
            joinUser: mockJoinUser.getFn()
          }
        },
        json: mockJSON.getFn()
      };
      chat.join({}, mockRes, mockNext.getFn());
    });
  });
});

function getMockWithCB(args, error, result) {
  return new Mock(function () {
    assert.equal(arguments.length, args.length);
    for(var i = 0; i < arguments.length; i++) {
      assert.equal(typeof arguments[i], args[i]);
    }
    var cb = arguments[arguments.length - 1];
    cb(error, result);
  });
}

function getMockWithDone(args, called, notCalled, done) {
  return new Mock(function () {
    assert.equal(arguments.length, args.length);
    for(var i = 0; i < arguments.length; i++) {
      assert.equal(typeof arguments[i], args[i]);
    }
    for (var i = 0; i < called.length; i++) {
      called[i].assertCalledOnce();
    }
    for (var i = 0; i < notCalled.length; i++) {
      notCalled[i].assertNotCalled();
    };
    done();
  });
}

function getMockToJSON() {
  return new Mock(function mockToJSON() {
    return {};
  });
}

function getMockInsert(err) {
  return  new Mock(function mockInsert(cb) {
    assert.equal(typeof cb, 'function');
    cb(err, {}); 
  }); 
}

function getMockInsertParticipants(err) {
  return new Mock(function mockInsertParticipants(cb) {
    assert.equal(typeof cb, 'function');
    cb(err, {});
  });
}

function getMockNotifyParticipants(err) {
  return new Mock(function mockNotifyParticipants(chat, cb) {
    assert.ok(chat.id);
    assert.equal(typeof cb, 'function');
    cb(err);
  });
}

function getMockRes(type, mockJSON, mockInsert, mockInsertParticipants, mockToJSON) {
  return {
    locals: {
      chat: {
        id: 1,
        type: type,
        insert: mockInsert.getFn(),
        insertParticipants: mockInsertParticipants.getFn(),
        toJSON: mockToJSON.getFn()
      }
    },
    json: mockJSON.getFn()
  };
}

function getMockNext(error, done) {
  return new Mock(function mockNext(err) {
    if (error) {
      assert.ok(err);
      done();
    } else {
      assert.ifError(err);
    }
  });
}

function testCreate(type, done, error) {
  var mockInsert = getMockInsert(error);
  var mockInsertParticipants = getMockInsertParticipants(error);
  var mockNotifyParticipants = getMockNotifyParticipants(error);
  var mockNext = getMockNext(error, done);
  var mockToJSON = getMockToJSON();

  chat.__set__({
    'notifyParticipants': mockNotifyParticipants.getFn()
  });

  var mockJSON = new Mock(function mockJSON(data) {
    mockInsert.assertCalledOnce();
    mockInsertParticipants.assertCalledOnce();
    if (type === 'group') {
      mockNotifyParticipants.assertCalledOnce();
    } else {
      mockNotifyParticipants.assertNotCalled();
    }
    
    assert.ok(data);
    done();
  });

  var mockRes = getMockRes(type, mockJSON, mockInsert, mockInsertParticipants, mockToJSON);

  if (type === 'thought') {
    mockRes.locals.thought = {};
  }

  chat.create({}, mockRes, mockNext.getFn());
}