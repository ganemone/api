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
// Shared variables
var validAuth = { username: 'username', password: 'sessionID' };
var invalidSessionAuth = { username: 'username', password: 'invalid' };
var invalidUsernameAuth = { username: 'invalid', password: 'sessionID' };
var invalidBoth = { username: 'invalid', password: 'invalid' };
var emptyAuth = {};

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
          assert.ok(res.body.participants);
          assert.ok(res.body.type);
          assert.ifError(res.body.degree);
          testChatDBEntry(
            res.body.uuid, 
            [
              { key: 'name', value: null }, 
              { key: 'type', value: res.body.type }
            ],
            [
              { key: 'username', value: 'friend1' },
              { key: 'status', value: 'pending' },
              { key: 'invited_by', value: 'username' } 
            ], 
            done
          );

        });
      });
      it('group', function (done) {
        done();        
      });
      it('thought', function (done) {
        done();
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
});

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
    db.queryWithData(query, data, function(err, rows) {
      if(err) {
        throw err;
      }
      var participantRows = rows[0];
      for (var i = 0; i < expectedParticipantEntries.length; i++) {
        var expectedParticipantRows = expectedParticipantEntries[i];
        for (var j = 0; j < expectedParticipantRows.length; j++) {
          var expected = expectedParticipantRows[i];
          assert.equal(participantRows[i][expected.key], expected.value);
        }
      }
      done();
    });
  });
}