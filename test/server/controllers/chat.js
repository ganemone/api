// External Modules
var assert = require('assert');
var rewire = require('rewire');
// Internal Modules
var chat = rewire('../../../server/controllers/chat.js');
var Mock = require('../../util/mock.js');

describe('A Chat Controller', function () {
  describe('create', function () {
    describe('a one to one', function () {
      it('should work', function (done) {
        testCreate('121', done);
      });
    });
    describe('a thought', function () {
      it('should work', function (done) {
        testCreate('thought', done);
      });
    });
    describe('a group', function () {
      it('should work', function (done) {
        testCreate('group', done);
      });
    });
    describe('handle errors', function () {
      
    });
  });
});

function getMockToJSON() {
  return new Mock(function mockToJSON() {
    return {};
  });
}

function getMockInsert() {
  return  new Mock(function mockInsert(cb) {
    assert.equal(typeof cb, 'function');
    cb(null, {}); 
  }); 
}

function getMockInsertParticipants() {
  return new Mock(function mockInsertParticipants(cb) {
    assert.equal(typeof cb, 'function');
    cb(null, {});
  });
}

function getMockNotifyParticipants() {
  return new Mock(function mockNotifyParticipants(chat, cb) {
    assert.ok(chat.id);
    assert.equal(typeof cb, 'function');
    cb();
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

function getMockNext() {
  return new Mock(function mockNext(err) {
    assert.ifError(err);
  });
}

function testCreate(type, done) {
  var mockInsert = getMockInsert();
  var mockInsertParticipants = getMockInsertParticipants();
  var mockNotifyParticipants = getMockNotifyParticipants();
  var mockNext = getMockNext();
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

  chat.create({}, mockRes, mockNext.getFn());
}