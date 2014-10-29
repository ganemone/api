var assert = require('assert');
var db = require('../../../server/db/index');

describe('A friend db model', function() {
  describe('class methods', function() {
    describe('makeFriends', function() {
      before(function(done) {
        db.User.build({
          username: 'testuser',
          password: 'password'
        }).save().then(function() {
          return db.User.build({
            username: 'anotheruser',
            password: 'password'
          }).save();
        }).then(function() {
          done();
        });
      });
      after(function(done) {
        db.User
          .destroy()
          .then(function() {
            done();
          });
      });
      it('should work', function(done) {
        db.Friend.makeFriends('testuser', 'anotheruser').then(function() {
          return db.Friend.find({
            where: {
              user_username: 'testuser',
              friend_username: 'anotheruser',
              status: 'friends'
            }
          });
        }).then(function(user) {
          assert.ok(user);
          return db.Friend.find({
            where: {
              user_username: 'anotheruser',
              friend_username: 'testuser',
              status: 'friends'
            }
          });
        }).then(function(user) {
          assert.ok(user);
          done();
        }, function(error) {
          done();
          console.error(error);
        });
      });
    });
  });
});