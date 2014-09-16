var assert = require('assert');
var setUpThoughts = require('../../util/setUpThoughts.js');
var User = require('../../../server/models/user.js');
var thoughts = require('../../../server/controllers/thoughts.js');

function testThoughtsController(username, friends, secondDegreeFriends, expectedLength, done) {
  var mockReq = {};
  var mockNext = function(err) {
    assert.ifError(err);
  };
  var user = new User({
    username: username
  });
  user.friends = friends;
  user.secondDegreeFriends = secondDegreeFriends;
  var mockRes = {
    locals: {
      user: user
    },
    json: function(data) {
      assert.ok(data);
      assert.equal(data.length, expectedLength);
      done()
    }
  }
  thoughts.index(mockReq, mockRes, mockNext);
}

describe('A thoughts controller', function () {  
  
  describe('when no thoughts are posted', function () {
    it('should return [] for a user with friends', function (done) {
      testThoughtsController('g', ['friend1', 'friend2', 'friend3'], ['friend4', 'friend5'], 0, done);
    });
    it('should return [] for a user without second degree friends', function (done) {
      testThoughtsController('g', ['friend1', 'friend2', 'friend3'], [], 0, done);
    });
    it('should return [] for a user without any friends', function (done) {
      testThoughtsController('g', [], [], 0, done);
    });
  });
  
  describe('when thoughts are posted', function () {
    setUpThoughts('g');
    setUpThoughts('friend1');
    setUpThoughts('friend2');
    setUpThoughts('friend4');
    setUpThoughts('friend5');
    setUpThoughts('someguy');
    setUpThoughts('anotherguy');
    it('should work for a user with friends', function (done) {
      testThoughtsController('g', ['friend1', 'friend2', 'friend3'], ['friend4', 'friend5'], 7, done);
    });
    it('should work for a user without second degree friends', function (done) {
      testThoughtsController('g', ['friend1', 'friend2', 'friend3'], [], 7, done);
    });
    it('should work for a user with no friends', function (done) {
      testThoughtsController('g', [], [], 7, done);
    }); 
  });
});
