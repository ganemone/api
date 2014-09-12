var expect = require('chai').expect;
var db = require('../../../server/util/db');
var setUpUser = require('../../util/setup-user.js');
var User = require('../../../server/models/user');

describe('A user model', function () {

  var userData = {
    username: 'username',
    email: 'ganemone@gmail.com',
    password: 'password',
    sessionID: 'sessionID',
    passwordKey: 'passwordKey'
  };

  describe('when inserting/deleting data', function () {
    var user = new User(userData);
    it('should insert into the users table correctly', function (done) {
      user.insert(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert session data correctly', function (done) {
      user.insertSession(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert password data correctly', function (done) {
      user.insertPasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert email info correctly', function (done) {
      user.insertInfo(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete users data correctly', function (done) {
      user.delete(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete session data correctly', function (done) {
      user.deleteSession(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete password key data correctly', function (done) {
      user.deletePasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
  });
  
  describe('when loading by email', function () {
    setUpUser(userData);

    it('should load the username correctly', function (done) {
      var user = new User({ email: 'ganemone@gmail.com'})
      user.loadFromEmail(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.be.ok;
        expect(result).to.equal('username');
        done();
      });
    });
  });

  describe('when loading data', function () {

    setUpUser(userData);

    it('should be constructed with a username, password, sessionID, and password key', function () {
      var user = new User(userData);
      expect(user).to.be.ok;
      expect(user.username).to.equal(userData.username);
      expect(user.password).to.equal(userData.password);
      expect(user.sessionID).to.equal(userData.sessionID);
      expect(user.passwordKey).to.equal(userData.passwordKey);
    });

    it('should validate a password key correctly', function (done) {
      var user = new User(userData);
      user.hasValidPasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(true);
        done();
      });
    });

    it('should invalidate a password key correctly', function (done) {
      var user = new User({ username: 'anotherUser', passwordKey: 'invalid' });
      user.hasValidPasswordKey(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(false);
        done();
      });
    });

    it('should validate a session id correctly', function (done) {
      var user = new User(userData);
      user.hasValidSessionID(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(true);
        done();
      });
    });

    it('should invalidate a session id correctly', function (done) {
      var user = new User({ username: 'anotherUser', sessionID: 'invalid' });
      user.hasValidSessionID(function(err, result) {
        expect(err).to.not.be.ok;
        expect(result).to.equal(false);
        done();
      });
    });
  });
});