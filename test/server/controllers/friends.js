var assert = require('assert');
var setUpUser = require('../../util/setUpUser');
var FriendsController = require('../../../server/controllers/friends');

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
  });
});