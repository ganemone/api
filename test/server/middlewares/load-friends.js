var assert = require('assert');
var _ = require('underscore');
var setUpUser = require('../../util/setup-user.js');
var setUpRosterUsers = require('../../util/setup-rosterusers.js');
var LoadFriends = require('../../../server/middlewares/load-friends.js');
var User = require('../../../server/models/user.js');

var runBefore = function() {
  before(function () {
    var user = new User({
      username: 'username',
      sessionID: 'sessionID'
    });
    var mockRes = {
      locals: {
        user: user
      }
    };
    this.mockRes = mockRes;
  });
};

function testUserFriends(user, expectedFriends, expectedSecondDegreeFriends) {
  user.friends = user.friends.sort();
  user.secondDegreeFriends = user.secondDegreeFriends.sort();
  assert.deepEqual(user.friends, expectedFriends);
  assert.deepEqual(user.secondDegreeFriends, expectedSecondDegreeFriends);
}

describe('The load friends middleware', function () {
  
  setUpUser({
    username: 'username',
    password: 'password',
    sessionID: 'sessionID'    
  });

  describe('when a user has no friends', function() {
    runBefore();
    it('should work', function (done) {
      var user = this.mockRes.locals.user;
      var mockNext = function(err) {
        assert.ifError(err);
        assert.deepEqual(user.friends, []);
        assert.deepEqual(user.secondDegreeFriends, []);
        done();
      };  
      LoadFriends({}, this.mockRes, mockNext);
    });
  });

  describe('when a user has no second degree friends', function() {
    runBefore();
    setUpRosterUsers('username', ['friend1', 'friend2']);
    it('should work', function (done) {
      var user = this.mockRes.locals.user;
      var mockNext = function(err) {
        assert.ifError(err);
        testUserFriends(user, ['friend1', 'friend2'], []);
        done();
      };  
      LoadFriends({}, this.mockRes, mockNext);
    });
  });

  describe('when a user has friends', function() {
    runBefore();
    setUpRosterUsers('username', ['friend1', 'friend2', 'friend3']);
    setUpRosterUsers('friend1', ['friend4', 'friend5']);
    setUpRosterUsers('friend2', ['friend6', 'friend7']);

    it('should work', function (done) {
      var user = this.mockRes.locals.user;
      var mockNext = function(err) {
        assert.ifError(err);
        testUserFriends(user, ['friend1', 'friend2', 'friend3'], ['friend4', 'friend5', 'friend6', 'friend7']);
        done();
      };  
      LoadFriends({}, this.mockRes, mockNext);
    });
  });

  describe('when a user has overlapping second degree friends', function () {
    runBefore();
    setUpRosterUsers('username', ['friend1', 'friend2', 'friend3']);
    setUpRosterUsers('friend1', ['friend2', 'friend3', 'friend4', 'friend5']);
    setUpRosterUsers('friend2', ['friend3', 'friend4', 'friend5', 'friend6']);
    setUpRosterUsers('friend3', ['friend7']);
    setUpRosterUsers('friend6', ['friend1', 'friend7']);
    setUpRosterUsers('friend7', ['someguy']);
    setUpRosterUsers('someguy', ['anotherguy']);
    setUpRosterUsers('weirdo', ['thisdude', 'theman']);
    it('should not load duplicates', function (done) {

      var user = this.mockRes.locals.user;
      var mockNext = function(err) {
        assert.ifError(err);
        testUserFriends(user, ['friend1', 'friend2', 'friend3'], ['friend4', 'friend5', 'friend6', 'friend7']);
        done();
      };  
      LoadFriends({}, this.mockRes, mockNext);
    });
  });
});
