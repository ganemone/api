var assert = require('assert');
var expect = require('chai').expect;
var setUpUser = require('../../util/setup-user.js');
var setUpDeviceToken = require('../../util/setUpDeviceToken.js');
var User = require('../../../server/models/user');
var cleanUpTable = require('../../util/cleanUpTable.js');

describe('A user model', function () {

  var userData = {
    username: 'username',
    email: 'ganemone@gmail.com',
    password: 'password',
    sessionID: 'sessionID',
    passwordKey: 'passwordKey'
  };

  describe('when inserting/deleting data', function () {
    cleanUpTable('username_phone_email');
    cleanUpTable('users');
    cleanUpTable('rosterusers');
    var user = User(userData);
    it('should insert into the users table correctly', function (done) {
      user.insert(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert session data correctly', function (done) {
      user.insertSession(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert password data correctly', function (done) {
      user.insertPasswordKey(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should insert email info correctly', function (done) {
      user.insertInfo(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete users data correctly', function (done) {
      user.delete(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete session data correctly', function (done) {
      user.deleteSession(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result.affectedRows).to.equal(1);
        expect(result.fieldCount).to.equal(0);
        done();
      });
    });
    it('should delete password key data correctly', function (done) {
      user.deletePasswordKey(function(err, result) {
        assert.ifError(err);
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
      var user = User({ email: 'ganemone@gmail.com'});
      user.loadFromEmail(function(err, result) {
        assert.ifError(err);
        expect(result).to.be.ok;
        expect(result).to.equal('username');
        done();
      });
    });
  });

  describe('when loading data', function () {

    setUpUser(userData);

    it('should be constructed with a username, password, sessionID, and password key', function () {
      var user = User(userData);
      expect(user).to.be.ok;
      expect(user.username).to.equal(userData.username);
      expect(user.password).to.equal(userData.password);
      expect(user.sessionID).to.equal(userData.sessionID);
      expect(user.passwordKey).to.equal(userData.passwordKey);
    });

    it('should validate a password key correctly', function (done) {
      var user = User(userData);
      user.hasValidPasswordKey(function(err, result) {
        assert.ifError(err);
        expect(result).to.equal(true);
        done();
      });
    });

    it('should load a password key correctly', function (done) {
      var user = User({
        email: userData.email
      });
      user.loadPasswordKey(function(err, result) {
        assert.ifError(err);
        expect(result['password_key']).to.be.ok; // jshint ignore:line
        expect(user.passwordKey).to.be.ok;
        done();
      });
    });

    it('should invalidate a password key correctly', function (done) {
      var user = User({ username: 'anotherUser', passwordKey: 'invalid' });
      user.hasValidPasswordKey(function(err, result) {
        assert.ifError(err);
        expect(result).to.equal(false);
        done();
      });
    });

    it('should validate a session id correctly', function (done) {
      var user = User(userData);
      user.hasValidSessionID(function(err, result) {
        assert.ifError(err);
        expect(result).to.equal(true);
        done();
      });
    });

    it('should invalidate a session id correctly', function (done) {
      var user = User({ username: 'anotherUser', sessionID: 'invalid' });
      user.hasValidSessionID(function(err, result) {
        assert.ifError(err);
        expect(result).to.equal(false);
        done();
      });
    });
  });
  describe('loadDeviceInfo', function () {
    setUpDeviceToken('somedude', 'sometoken', 'android');
    setUpDeviceToken('thisguy', 'anothertoken', 'ios');
    describe('when there is no info', function () {
      it('should not load any data', function (done) {
        var user = User({username: 'username'});
        user.getDeviceInfo(function(err) {
          assert.ifError(err);
          assert.equal(user.hasAndroid(), false);
          assert.equal(user.hasIOS(), false);
          assert.ifError(user.deviceType);
          assert.ifError(user.token);
          done();
        });
      });
    });
    describe('when it is an android phone', function () {
      setUpDeviceToken('username', 'token', 'android');
      it('should load the token correctly', function (done) {
        var user = User({username: 'username'});
        user.getDeviceInfo(function(err) {
          assert.ifError(err);
          assert.equal(user.hasAndroid(), true);
          assert.equal(user.hasIOS(), false);
          assert.equal(user.deviceType, 'android');
          assert.equal(user.token, 'token');
          done();
        });
      });
    });
    describe('when it is an iOS phone', function () {
      setUpDeviceToken('username', 'token', 'ios');
      it('should load the token correctly', function (done) {
        var user = User({username: 'username'});
        user.getDeviceInfo(function(err) {
          assert.ifError(err);
          assert.equal(user.hasAndroid(), false);
          assert.equal(user.hasIOS(), true);
          assert.equal(user.deviceType, 'ios');
          assert.equal(user.token, 'token');
          done();
        });
      });
    });
  });
});