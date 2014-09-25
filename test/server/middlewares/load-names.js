var assert = require('assert');
var setUpVCard = require('../../util/setUpVCard.js');
var LoadNames = require('../../../server/middlewares/load-names.js');

describe('LoadNames middleware', function () {
  setUpVCard('username', 'Giancarlo Anemone');
  setUpVCard('friend1', 'Friend One');
  setUpVCard('friend2', 'Friend Two');
  setUpVCard('friend3', 'Friend Three');
  describe('active', function () {
    describe('when a user has no friends', function () {
      it('should work', function (done) {
        var mockUser = {
          friends: []
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.pendingFriends);
          assert.deepEqual(mockRes.locals.activeFriends, []);
          done();
        };
        LoadNames.active({}, mockRes, mockNext);
      });
    });
    describe('when a user has 1 friend', function () {
      it('should work', function (done) {
        var mockUser = {
          friends: ['friend1']
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.pendingFriends);
          assert.deepEqual(mockRes.locals.activeFriends, [{username: 'friend1', name: 'Friend One'}]);
          done();
        };
        LoadNames.active({}, mockRes, mockNext);
      });
    });
    describe('when a user has multiple friends', function () {
      it('should work', function (done) {
        var mockUser = {
          friends: ['friend1', 'friend2', 'friend3']
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.pendingFriends);
          assert.deepEqual(mockRes.locals.activeFriends, [
            {username: 'friend1', name: 'Friend One'},
            {username: 'friend2', name: 'Friend Two'},
            {username: 'friend3', name: 'Friend Three'}
          ]);
          done();
        };
        LoadNames.active({}, mockRes, mockNext);
      });
    });
  });
  describe('pending', function () {
    describe('when a user has no friends', function () {
      it('should work', function (done) {
        var mockUser = {
          pendingFriends: []
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.activeFriends);
          assert.deepEqual(mockRes.locals.pendingFriends, []);
          done();
        };
        LoadNames.pending({}, mockRes, mockNext);
      });
    });
    describe('when a user has 1 friend', function () {
      it('should work', function (done) {
        var mockUser = {
          pendingFriends: ['friend1']
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.activeFriends);
          assert.deepEqual(mockRes.locals.pendingFriends, [{username: 'friend1', name: 'Friend One'}]);
          done();
        };
        LoadNames.pending({}, mockRes, mockNext);
      });
    });
    describe('when a user has multiple friends', function () {
      it('should work', function (done) {
        var mockUser = {
          pendingFriends: ['friend1', 'friend2', 'friend3']
        };
        var mockRes = {
          locals: {
            user: mockUser
          }
        };
        var mockNext = function(err) {
          assert.ifError(err);
          assert.ifError(mockRes.locals.activeFriends);
          assert.deepEqual(mockRes.locals.pendingFriends, [
            {username: 'friend1', name: 'Friend One'},
            {username: 'friend2', name: 'Friend Two'},
            {username: 'friend3', name: 'Friend Three'}
          ]);
          done();
        };
        LoadNames.pending({}, mockRes, mockNext);
      });
    });
  });
});