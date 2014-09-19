var async = require('async');
var assert = require('assert');
var Blacklist = require('../../../server/models/blacklist.js');
var db = require('../../../server/util/db.js');
var setUpBlacklist = require('../../util/setUpBlacklist.js');
var setUpUsernamePhoneEmail = require('../../util/setUpUsernamePhoneEmail.js');
var usernameToJID = require('../../../server/util/usernameToJID.js');
var cleanUpTable = require('../../util/cleanUpTable.js');

function testAddFriends(usernames, result, done) {
  var mockUser = {
    username: 'username'
  };
  var blm = Blacklist(mockUser);
  blm.addFriends(usernames, function(err, result) {
    assert.ifError(err);
    assert.equal(result, result);
    db.queryWithData('SELECT username FROM rosterusers WHERE jid = ?', [usernameToJID(mockUser.username)], function(err, rows) {
      assert.ifError(err);
      assert.equal(usernames.length, rows.length);
      done();
    });
  });
}

function testMakeRequest(phones, emails, expectedLength, done) {
  var mockUser = {
    username: 'username'
  };
  var blm = Blacklist(mockUser, phones, emails);
  async.waterfall([
    blm.makeRequest.bind(blm),
    function(result, cb) {
      assert.equal(result, expectedLength > 0);
      db.queryWithData('SELECT username FROM rosterusers WHERE jid = ?', [usernameToJID(mockUser.username)], cb);
    },
    function(result, cb) {
      assert.equal(result.length, expectedLength);
      db.queryWithData('SELECT jid FROM rosterusers WHERE username = ?', [mockUser.username], cb);
    }
  ], function(err, result) {
    assert.ifError(err);
    assert.equal(result.length, expectedLength);
    done();
  });
}
describe('blacklist model', function () {
  describe('hasMadeRequest', function () {
    describe('when false', function () {
      it('should return false', function (done) {
        var blm = Blacklist('username');
        blm.hasMadeRequest(function(err, hasMadeRequest) {
          assert.ifError(err);
          assert.equal(hasMadeRequest, false);
          done();
        });
      });
    });
    describe('when true', function () {
      setUpBlacklist('username');
      it('should return true', function (done) {
        var mockUser = {
          username: 'username'
        };
        var blm = Blacklist(mockUser);
        blm.hasMadeRequest(function(err, hasMadeRequest) {
          assert.ifError(err);
          assert.equal(hasMadeRequest, true);
          done();
        });
      });
    });
  });

  describe('setHasMadeRequest', function() {
    after(function (done) {
      var query = 'DELETE FROM blacklist';
      db.directQuery(query, function(err, rows) {
        done();
      });
    });
    it('should work', function (done) {
      var mockUser = {
        username: 'username'
      };
      var blm = Blacklist(mockUser);
      blm.setHasMadeRequest(function(err) {
        assert.ifError(err);
        blm.hasMadeRequest(function(err, result) {
          assert.ifError(err);
          assert.equal(result, true);
          done();
        });
      });
    });
  });
  describe('getFriends', function () {
    describe('without friends', function () {
      setUpUsernamePhoneEmail('friend1', '1', '1', 'friend1@email.com');
      setUpUsernamePhoneEmail('friend2', '1', '12', 'friend2@email.com');
      it('should work', function (done) {
        var mockUser = {
          username: 'username'
        };
        var blm = Blacklist(mockUser, ['123', '456'], ['a@email.com', 'b@email.com']);
        blm.getFriends(function(err, usernames) {
          assert.ifError(err);
          assert.equal(usernames instanceof Array, true);
          assert.equal(usernames.length, 0);
          done();
        });
      });
    });
    describe('with friends', function() {
      setUpUsernamePhoneEmail('friend1', '1', '1', 'friend1@email.com');
      setUpUsernamePhoneEmail('friend2', '1', '12', 'friend2@email.com');
      setUpUsernamePhoneEmail('friend3', '1', '123123', 'a@email.com');
      setUpUsernamePhoneEmail('friend4', '1', '123123123', 'c@email.com');
      setUpUsernamePhoneEmail('someguy', '1', '23125123', 'e@gmail.com');

      it('should work', function (done) {
        var mockUser = {
          username: 'username'
        };
        var blm = Blacklist(mockUser, ['11', '12', '123123123'], ['a@email.com', 'b@email.com', 'c@email.com']);
        blm.getFriends(function(err, usernames) {
          assert.ifError(err);
          assert.equal(usernames instanceof Array, true);
          assert.equal(usernames.length, 4);
          assert.equal(usernames.indexOf('friend1') > -1, true);
          assert.equal(usernames.indexOf('friend2') > -1, true);
          assert.equal(usernames.indexOf('friend3') > -1, true);
          assert.equal(usernames.indexOf('friend4') > -1, true);
          done();
        });
      });
    });
  });
  describe('addFriends', function() {
    it('should work with an empty array', function (done) {
      testAddFriends([], false, done);
    });
    describe('with one username', function () {
      cleanUpTable('rosterusers');
      it('should work with one username', function (done) {
        testAddFriends(['friend1'], true, done);
      });
    });
    describe('with multiple usernames', function () {
      cleanUpTable('rosterusers');
      it('should work with multiple usernames', function (done) {
        testAddFriends(['friend1', 'friend2', 'friend3'], true, done);
      });
    });
  });

  describe('makeRequest', function () {
    describe('when no friends are found', function () {
      setUpUsernamePhoneEmail('someguy', '1', '4565138423', 'someguy@email.com');
      setUpUsernamePhoneEmail('thisdude', '1', '435751', 'thisdude@email.com');
      cleanUpTable('blacklist');
      cleanUpTable('rosterusers');
      it('should work', function (done) {
        testMakeRequest(
          ['12345','23456','34567'],
          ['a@email.com', 'b@email.com', 'c@email.com'],
          0,
          done
        );
      });
    });
    describe('when one friend is found', function () {
      setUpUsernamePhoneEmail('friend1', '1', '12345', 'a@email.com');
      setUpUsernamePhoneEmail('someguy', '1', '4565138423', 'someguy@email.com');
      setUpUsernamePhoneEmail('thisdude', '1', '435751', 'thisdude@email.com');
      cleanUpTable('blacklist');
      cleanUpTable('rosterusers');
      it('should work', function (done) {
        testMakeRequest(
          ['12345','23456','34567'],
          ['a@email.com', 'b@email.com', 'c@email.com'],
          1,
          done
        );
      });
    });
    describe('when multiple friends are found', function () {
      setUpUsernamePhoneEmail('friend1', '1', '12345', 'a@email.com');
      setUpUsernamePhoneEmail('friend2', '1', '41231', 'b@email.com');
      setUpUsernamePhoneEmail('friend3', '1', '34567', 'c@email.com');
      setUpUsernamePhoneEmail('someguy', '1', '4565138423', 'someguy@email.com');
      setUpUsernamePhoneEmail('thisdude', '1', '435751', 'thisdude@email.com');
      cleanUpTable('blacklist');
      cleanUpTable('rosterusers');
      it('should work', function (done) {
        testMakeRequest(
          ['12345','23456','34567'],
          ['a@email.com', 'b@email.com', 'c@email.com'],
          3,
          done
        );
      });
    });
  });
});