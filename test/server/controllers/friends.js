var db = require('../../../server/db/index');
var assert = require('assert');
var FriendsController = require('../../../server/controllers/friends');

describe('A friends controller', function () {
  describe('getFriends', function () {
    it('should work', function (done) {
      db.User.create({
        username: 'testuser',
        password: 'password'
      }).then(function(testuser) {
        return db.Friend.create({
          user_username: 'testuser',
          friend_username: 'friend',
          status: 'friends'
        });
      }).then(function(friend) {
        return db.Friend.create({
          user_username: 'friend',
          friend_username: 'testuser',
          status: 'friends'
        });
      }).then(function(friend2) {
        console.log('Finished');
        done();
      }, function(err) {
        console.log('An error occurred: ', err);
        done();
      });
    });
  });
});