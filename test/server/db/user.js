var assert = require('assert');
var db = require('../../../server/db/index');

describe('A user db model', function() {
  describe('isAuthenticatedUser', function() {
    before(function(done) {
      db.User
        .build({
          username: 'username',
          password: 'password'
        })
        .save()
        .then(function() {
          return db.Session
            .build({
              username: 'username',
              session_key: 'sessionkey'
            })
            .save();
        }).then(function() {
          done();
        });
    });
    after(function(done) {
      db.User.destroy().then(function() {
        done();
      });
    });
    it('should return true with authenticated users', function(done) {
      db.User
        .isAuthenticatedUser('username', 'sessionkey')
        .then(function(result) {
          assert.equal(result, true);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
    it('should fail for an invalid user', function(done) {
      db.User
        .isAuthenticatedUser('invalid', 'sessionkey')
        .then(function(result) {
          assert.equal(result, false);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
    it('should fail for an invalid session key', function(done) {
      db.User
        .isAuthenticatedUser('username', 'invalid')
        .then(function(result) {
          assert.equal(result, false);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
    it('should fail for empty user string', function(done) {
      db.User
        .isAuthenticatedUser('', 'sessionkey')
        .then(function(result) {
          assert.equal(result, false);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
    it('should fail for empty session key', function(done) {
      db.User
        .isAuthenticatedUser('username', '')
        .then(function(result) {
          assert.equal(result, false);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
    it('should fail for null session key', function(done) {
      db.User
        .isAuthenticatedUser('', null)
        .then(function(result) {
          assert.equal(result, false);
          done();
        })
        .catch(function(error) {
          assert.ifError(error);
        });
    });
  });
});