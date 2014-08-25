var expect = require('chai').expect;
var db = require('../../../server/util/db');
var User = require('../../../server/models/user');

describe('A user model', function () {

  before(function (done) {
    var user = new User('testuser');
    user.insert('password', function() {
      done();
    });
  });

  after(function (done) {
    var user = new User('testuser');
    user.delete(function() {
      done();
    });
  });

  it('should be constructed with a username and a sessionID', function () {
    var user = new User('testuser', 'testkey');
    expect(user).to.be.ok;
    expect(user.username).to.equal('testuser');
    expect(user.sessionID).to.equal('testkey');
  });

  describe('when updating a password', function () {
  });

  describe('when validating a password reset key', function () {
    before(function (done) {
      var query = 'INSERT INTO ?? (??) VALUES (?)';
      var data = ['password_reset', ['username', 'key'], ['testuser', 'testkey']];
      db.queryWithData(query, data, function(err, result) {
        done();
      });
    });
    after(function (done) {
      var query = 'DELETE FROM ?? WHERE ?? = ?';
      var data = ['password_reset', 'username', 'testuser'];
      db.queryWithData(query, data, function(err, result) {
        done();
      });
    });

    it('should return true for a valid password key', function (done) {
      var user = new User('testuser', 'testkey');
      user.hasValidResetPasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(true);
        done();
      });
    });

    it('should return false for an expired password key', function (done) {
      var query = 'UPDATE `password_reset` SET `timestamp` = (NOW() - INTERVAL 2 DAY) WHERE `username` = \'testuser\'';
      db.directQuery(query, function(err, result) {
        expect(err).to.not.be.ok;
        var user = new User('testuser', 'testkey');
        user.hasValidResetPasswordKey(function(err, result) {
          expect(err).to.not.be.ok;
          expect(result).to.equal(false);
          done();
        });
      });
    });

    it('should return false for a user with no password key', function (done) {
      var user = new User('someuser', 'withoutakey');
      user.hasValidResetPasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(false);
        done();
      });
    });
  });
});