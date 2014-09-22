// External Modules
var assert = require('assert');
var request = require('request');
// Internal Modules
var config = require('../../config/index.js');
var db = require('../../server/util/db.js');
var runServer = require('../util/runServer.js');
var cleanUpTable = require('../util/cleanUpTable.js');
var setUpUser = require('../util/setup-user.js');
var setUpRosterUsers = require('../util/setup-rosterusers.js');
var setUpThoughts = require('../util/setUpThoughts.js');
// Shared variables
var validAuth = { username: 'username', password: 'sessionID' };
var invalidSessionAuth = { username: 'username', password: 'invalid' };
var invalidUsernameAuth = { username: 'invalid', password: 'sessionID' };
var invalidBoth = { username: 'invalid', password: 'invalid' };
var emptyAuth = {};

function setUp() {
  // Set up main user
  setUpUser({ username: 'username', password: 'password', sessionID: 'sessionID' });
  // Set up supporting users
  setUpUser({ username: 'friend1', password: 'password', sessionID: 'sessionID' });
  setUpUser({ username: 'friend2', password: 'password', sessionID: 'sessionID' });
  setUpUser({ username: 'friend3', password: 'password', sessionID: 'sessionID' });
  setUpUser({ username: 'friend4', password: 'password', sessionID: 'sessionID' });
  setUpUser({ username: 'someguy', password: 'password', sessionID: 'sessionID' });
  setUpUser({ username: 'anotherguy', password: 'password', sessionID: 'sessionID' });

  // Set up friends
  setUpRosterUsers('username', ['friend1', 'friend2']);
  setUpRosterUsers('friend1', ['friend2', 'friend3']);
  setUpRosterUsers('friend2', ['friend3', 'friend4']);
  setUpRosterUsers('friend3', ['someguy', 'anotherguy']);
}

function testChatDBEntry(chatID, expectedChatValues, expectedParticipantEntries, done) {
  var query = 'SELECT * FROM chat WHERE uuid = ?';
  var data = [chatID];

  db.queryWithData(query, data, function(err, result) {
    if (err) {
      throw err;
    }
    var chatRow = result[0];

    for (var i = 0; i < expectedChatValues.length; i++) {
      var expected = expectedChatValues[i];
      assert.equal(chatRow[expected.key], expected.value);
    }

    var query2 = 'SELECT * FROM participants WHERE chat_id = ?';
    var data2 = [chatRow.id];
    db.queryWithData(query2, data2, function(err, rows) {
      if(err) {
        throw err;
      }
      for (var i = 0; i < expectedParticipantEntries.length; i++) {
        var expectedParticipantRows = expectedParticipantEntries[i];
        for (var j = 0; j < expectedParticipantRows.length; j++) {
          var expected = expectedParticipantRows[i];
          assert.equal(rows[i][expected.key], expected.value);
        }
      }
      done();
    });
  });
}

describe('Integration Tests for /chat', function () {
  setUp();

  cleanUpTable('chat');
  cleanUpTable('participants');

  runServer();

  describe('/create', function () {
    describe('121', function () {
      it('valid requests', function (done) {
        request.post({
          url: config.getEndpoint('/chat/create'),
          auth: validAuth,
          json: {
            type: '121',
            participants: ['friend1'],
          }
        }, function(err, res) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.ok(res.body.uuid);
          assert.ok(res.body.name);
          assert.ifError(res.body.participants);
          assert.equal(res.body.type, '121');
          assert.ifError(res.body.degree);
          testChatDBEntry(
            res.body.uuid,
            [
              { key: 'name', value: null },
              { key: 'type', value: res.body.type }
            ],
            [[
              { key: 'username', value: 'friend1' },
              { key: 'status', value: 'pending' },
              { key: 'invited_by', value: 'username' }
            ]],
            done
          );
        });
      });
    });
    describe('group', function () {
      it('valid requests', function (done) {
        request.post({
          url: config.getEndpoint('/chat/create'),
          auth: validAuth,
          json: {
            type: 'group',
            name: 'a+group',
            participants: ['friend1', 'friend2']
          }
        }, function(err, res) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.ok(res.body.uuid);
          assert.equal(res.body.name, 'a+group');
          assert.ok(res.body.participants);
          assert.equal(res.body.type, 'group');
          assert.ifError(res.body.degree);
          testChatDBEntry(
            res.body.uuid,
            [
              { key: 'name', value: res.body.name },
              { key: 'type', value: res.body.type }
            ],
            [[
              { key: 'username', value: 'friend1' },
              { key: 'status', value: 'pending' },
              { key: 'invited_by', value: 'username' }
            ], [
              { key: 'username', value: 'friend2' },
              { key: 'status', value: 'pending' },
              { key: 'invited_by', value: 'username' }
            ]],
            done
          );
        });
      });
    });
    describe('thought', function () {
      describe('1st degree', function () {
        setUpThoughts('friend1');
        it('should work', function (done) {
          var cid = this.cid;
          request.post({
            url: config.getEndpoint('/chat/create'),
            auth: validAuth,
            json: {
              type: 'thought',
              cid: cid
            }
          }, function(err, res) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.ok(res.body.uuid);
            assert.equal(res.body.name, 'some+thought');
            assert.ifError(res.body.participants);
            assert.equal(res.body.type, 'thought');
            assert.equal(res.body.degree, 1);
            testChatDBEntry(
              res.body.uuid,
              [
                { key: 'name', value: res.body.name },
                { key: 'type', value: res.body.type }
              ],
              [[
                { key: 'username', value: 'friend1' },
                { key: 'status', value: 'pending' },
                { key: 'invited_by', value: 'username' }
              ]],
              done
            );
          });
        });
      });
      describe('2nd degree', function () {
        setUpThoughts('friend3');
        it('should work', function (done) {
          var cid = this.cid;
          request.post({
            url: config.getEndpoint('/chat/create'),
            auth: validAuth,
            json: {
              type: 'thought',
              cid: cid
            }
          }, function(err, res) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.ok(res.body.uuid);
            assert.equal(res.body.name, 'some+thought');
            assert.ifError(res.body.participants);
            assert.equal(res.body.type, 'thought');
            assert.equal(res.body.degree, 2);
            testChatDBEntry(
              res.body.uuid,
              [
                { key: 'name', value: res.body.name },
                { key: 'type', value: res.body.type }
              ],
              [[
                { key: 'username', value: 'friend3' },
                { key: 'status', value: 'pending' },
                { key: 'invited_by', value: 'username' }
              ]],
              done
            );
          });
        });
      });
    });
  });
});
describe('/leave', function () {

});
describe('/join', function () {

});
describe('/joined', function () {

});

describe('/pending', function () {

});
