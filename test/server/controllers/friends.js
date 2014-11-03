var assert = require('assert');
var db = require('../../../server/db/index');
var setUpUser = require('../../util/setUpUser');
var setUpFriends = require('../../util/setUpFriends');
var FriendsController = require('../../../server/controllers/friends');
var noop = function noop() {};
describe('A friends controller', function() {
  describe('getFriends', function() {
    describe('no friends', function() {
      setUpUser({
        username: 'username',
        password: 'password'
      });
      it('should return an empty list', function(done) {
        var mockRes = {
          locals: {
            user: this.user
          },
          json: function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 0);
            done();
          }
        };
        var next = function() {
          assert.fail('Next called', 'Expected next not to be called');
        };
        FriendsController.getFriends({}, mockRes, next);
      });
    });
    describe('with friends', function() {
      setUpUser({
        username: 'username',
        password: 'password'
      });
      setUpUser({
        username: 'friend',
        password: 'password'
      });
      setUpUser({
        username: 'friend2',
        password: 'password'
      });
      setUpUser({
        username: 'friend3',
        password: 'password'
      });
      setUpUser({
        username: 'secondDegree1',
        password: 'password'
      });
      setUpUser({
        username: 'secondDegree2',
        password: 'password'
      });
      setUpUser({
        username: 'secondDegree3',
        password: 'password'
      });
      setUpUser({
        username: 'noConnection1',
        password: 'password'
      });
      setUpUser({
        username: 'noConnection2',
        password: 'password'
      });
      setUpUser({
        username: 'pending1',
        password: 'password'
      });
      setUpUser({
        username: 'requested1',
        password: 'password'
      });
      setUpUser({
        username: 'was_rejected1',
        password: 'password'
      });
      setUpUser({
        username: 'did_reject1',
        password: 'password'
      });
      setUpFriends('username', 'friend', 'friends');
      setUpFriends('username', 'friend2', 'friends');
      setUpFriends('username', 'friend3', 'friends');
      setUpFriends('friend', 'friend2', 'friends');
      setUpFriends('friend', 'friend3', 'friends');
      setUpFriends('friend', 'secondDegree1', 'friends');
      setUpFriends('friend', 'secondDegree2', 'friends');
      setUpFriends('noConnection1', 'noConnection2', 'friends');
      setUpFriends('username', 'pending1', 'pending');
      setUpFriends('username', 'requested1', 'requested');
      setUpFriends('username', 'was_rejected1', 'was_rejected');
      setUpFriends('username', 'did_reject1', 'did_reject');

      before(function(done) {
        var self = this;
        db.User
          .find({
            where: {
              username: 'username'
            }
          })
          .then(function(user) {
            self.user = user;
            self.mockRes = {
              locals: {
                user: user
              },
              json: noop
            };
            self.next = noop;
            done();
          });
      });
      it('should return correct friends', function(done) {
        FriendsController
          .getFriends({}, this.mockRes, this.next)
          .then(function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 3);
            done();
          })
          .catch(function(error) {
            done(error);
          });
      });
      it('should return correct pending friends', function(done) {
        FriendsController
          .getPendingFriends({}, this.mockRes, this.next)
          .then(function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 1);
            assert.equal(friends[0].friend_username, 'pending1');
            done();
          }).catch(function(error) {
            done(error);
          });
      });
      it('should return correct requested friends', function (done) {
        FriendsController
          .getRequestedFriends({}, this.mockRes, this.next)
          .then(function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 1);
            assert.equal(friends[0].friend_username, 'requested1');
            done();
          }).catch(function(error) {
            done(error);
          });
      });
      it('should return correct was rejected friends', function (done) {
        FriendsController
          .getWasRejectedFriends({}, this.mockRes, this.next)
          .then(function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 1);
            assert.equal(friends[0].friend_username, 'was_rejected1');
            done();
          }).catch(function(error) {
            done(error);
          });
      });
      it('should return correct did reject friends', function (done) {
        FriendsController
          .getDidRejectFriends({}, this.mockRes, this.next)
          .then(function(friends) {
            assert.ok(friends);
            assert.equal(friends.length, 1);
            assert.equal(friends[0].friend_username, 'did_reject1');
            done();
          }).catch(function(error) {
            done(error);
          });
      });
    });
  });
});