// External Modules
var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
var request = require('request');
// Internal Modules
var config = require('../../config/index.js');
var db = require('../../server/util/db.js');
var runServer = require('../util/runServer.js');
var cleanUpTable = require('../util/cleanUpTable.js');
var setUpUser = require('../util/setup-user.js');
var setUpRosterUsers = require('../util/setup-rosterusers.js');
var setUpThoughts = require('../util/setUpThoughts.js');
var setUpFullChat = require('../util/setUpFullChat.js');
var setUpVCard = require('../util/setUpVCard.js');
// Shared variables
var validAuth = {
  username: 'username',
  password: 'sessionID'
};
// var invalidSessionAuth = {
//   username: 'username',
//   password: 'invalid'
// };
// var invalidUsernameAuth = {
//   username: 'invalid',
//   password: 'sessionID'
// };
// var invalidBoth = {
//   username: 'invalid',
//   password: 'invalid'
// };
// var emptyAuth = {};

function setUp() {
  // Set up main user
  setUpUser({
    username: 'username',
    password: 'password',
    sessionID: 'sessionID'
  });
  // Set up supporting users
  setUpUser({
    username: 'friend1',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpUser({
    username: 'friend2',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpUser({
    username: 'friend3',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpUser({
    username: 'friend4',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpUser({
    username: 'someguy',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpUser({
    username: 'anotherguy',
    password: 'password',
    sessionID: 'sessionID'
  });

  // Set up friends
  setUpRosterUsers('username', ['friend1', 'friend2']);
  setUpRosterUsers('friend1', ['friend2', 'friend3']);
  setUpRosterUsers('friend2', ['friend3', 'friend4']);
  setUpRosterUsers('friend3', ['someguy', 'anotherguy']);

  setUpVCard('username', 'my name');
  setUpVCard('friend1', 'friend1 name');
  setUpVCard('friend2', 'friend2 name');
  setUpVCard('friend3', 'friend3 name');
  setUpVCard('friend4', 'friend4 name');
  setUpVCard('someguy', 'some guy');
  setUpVCard('anotherguy', 'another guy');
}

function testChatDBEntry(chatID, expectedChatValues, expectedParticipantEntries, done) {
  var query = 'SELECT * FROM chat WHERE uuid = ?';
  var data = [chatID];

  db.queryWithData(query, data, function (err, result) {
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
    db.queryWithData(query2, data2, function (err, rows) {
      if (err) {
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
        }, function (err, res) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.ok(res.body.uuid);
          assert.ok(res.body.name);
          assert.ok(res.body.isOwner);
          assert.ifError(res.body.participants);
          assert.equal(res.body.type, '121');
          assert.ifError(res.body.degree);
          testChatDBEntry(
            res.body.uuid, [{
              key: 'name',
              value: null
            }, {
              key: 'type',
              value: res.body.type
            }], [
              [{
                key: 'username',
                value: 'friend1'
              }, {
                key: 'status',
                value: 'pending'
              }, {
                key: 'invited_by',
                value: 'username'
              }]
            ],
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
        }, function (err, res) {
          assert.ifError(err);
          assert.equal(res.statusCode, 200);
          assert.ok(res.body.uuid);
          assert.equal(res.body.name, 'a+group');
          assert.ok(res.body.participants);
          assert.equal(res.body.type, 'group');
          assert.ifError(res.body.degree);
          testChatDBEntry(
            res.body.uuid, [{
              key: 'name',
              value: res.body.name
            }, {
              key: 'type',
              value: res.body.type
            }], [
              [{
                key: 'username',
                value: 'friend1'
              }, {
                key: 'status',
                value: 'pending'
              }, {
                key: 'invited_by',
                value: 'username'
              }],
              [{
                key: 'username',
                value: 'friend2'
              }, {
                key: 'status',
                value: 'pending'
              }, {
                key: 'invited_by',
                value: 'username'
              }]
            ],
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
          }, function (err, res) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.ok(res.body.uuid);
            assert.equal(res.body.name, 'some+thought');
            assert.ifError(res.body.participants);
            assert.equal(res.body.type, 'thought');
            assert.equal(res.body.degree, 1);
            testChatDBEntry(
              res.body.uuid, [{
                key: 'name',
                value: res.body.name
              }, {
                key: 'type',
                value: res.body.type
              }], [
                [{
                  key: 'username',
                  value: 'friend1'
                }, {
                  key: 'status',
                  value: 'pending'
                }, {
                  key: 'invited_by',
                  value: 'username'
                }]
              ],
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
          }, function (err, res) {
            assert.ifError(err);
            assert.equal(res.statusCode, 200);
            assert.ok(res.body.uuid);
            assert.equal(res.body.name, 'some+thought');
            assert.ifError(res.body.participants);
            assert.equal(res.body.type, 'thought');
            assert.equal(res.body.degree, 2);
            testChatDBEntry(
              res.body.uuid, [{
                key: 'name',
                value: res.body.name
              }, {
                key: 'type',
                value: res.body.type
              }], [
                [{
                  key: 'username',
                  value: 'friend3'
                }, {
                  key: 'status',
                  value: 'pending'
                }, {
                  key: 'invited_by',
                  value: 'username'
                }]
              ],
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
describe('Integration tests for /joined', function () {
  runServer();
  setUpUser({
    username: 'username',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpVCard('username', 'my name');
  setUpVCard('friend1', 'friend1 name');
  setUpVCard('friend2', 'friend2 name');
  setUpVCard('friend3', 'friend3 name');
  setUpVCard('friend4', 'friend4 name');
  setUpVCard('friend5', 'friend5 name');
  setUpFullChat({
    type: '121',
    owner: 'username',
    participants: ['friend1'],
  });
  setUpFullChat({
    type: '121',
    owner: 'friend1',
    participants: ['username'],
  });
  setUpFullChat({
    type: 'group',
    owner: 'username',
    participants: ['friend1', 'friend2', 'friend3'],
    name: 'group+name'
  });
  setUpFullChat({
    type: 'group',
    owner: 'friend1',
    participants: ['username', 'friend2', 'friend5'],
    name: 'group+name+2'
  });
  setUpFullChat({
    type: 'thought',
    owner: 'username',
    participants: ['friend1'],
    name: 'thought+name'
  });
  setUpFullChat({
    type: 'thought',
    owner: 'friend1',
    participants: ['username'],
    name: 'thought+name+2'
  });

  before(function (done) {
    var self = this;
    var endpoint = config.getEndpoint('/chat/joined');
    request.get({
      url: endpoint,
      auth: validAuth,
      json: {}
    }, function (err, res, body) {
      self.err = err;
      self.res = res;
      done();
    });
  });
  it('should execute without error', function () {
    assert.ifError(this.err);
  });
  it('should return 200 status code', function () {
    assert.equal(this.res.statusCode, 200);
  });
  it('should return json content type', function () {
    assert.equal(this.res.headers['content-type'], 'application/json; charset=utf-8');
  });
  it('should return the correct number of chats', function () {
    assert.equal(this.res.body.length, 5);
    this.res.body.forEach(function (chat) {
      assert.ok(chat.uuid);
      if (chat.type === 'group') {
        assert.equal(chat.name, 'group+name');
        assert.include(chat.participants, {
          username: 'friend1',
          name: 'friend1 name'
        });
        assert.include(chat.participants, {
          username: 'friend2',
          name: 'friend2 name'
        });
        assert.include(chat.participants, {
          username: 'friend3',
          name: 'friend3 name'
        });
        assert.include(chat.participants, {
          username: 'username',
          name: 'my name'
        });
        assert.equal(chat.owner, 'username');
      } else if (chat.type === '121') {
        assert.ifError(chat.participants);
        assert.ifError(chat.owner);
        if (chat.isOwner) {
          assert.equal(chat.name, 'friend1 name');
        } else {
          assert.equal(chat.name, 'Anonymous Friend');
        }
      } else if (chat.type === 'thought') {
        assert.ifError(chat.participants);
        assert.ifError(chat.owner);
        assert.include(chat.name, 'thought+name');
      } else {
        assert.fail('Chat type to be group, 121, or thought', chat.type);
      }
    });
  });
});

describe('Integration tests for /pending', function () {
  runServer();
  setUpUser({
    username: 'username',
    password: 'password',
    sessionID: 'sessionID'
  });
  setUpVCard('username', 'my name');
  setUpVCard('friend1', 'friend1 name');
  setUpVCard('friend2', 'friend2 name');
  setUpVCard('friend3', 'friend3 name');
  setUpVCard('friend4', 'friend4 name');
  setUpVCard('friend5', 'friend5 name');
  setUpFullChat({
    type: '121',
    owner: 'username',
    participants: ['friend1'],
    name: '121+name',
  });
  setUpFullChat({
    type: '121',
    owner: 'username',
    participants: ['friend1'],
    name: '121+name',
  });
  setUpFullChat({
    type: 'group',
    owner: 'username',
    participants: ['friend1', 'friend2', 'friend3'],
    name: 'group+name'
  });
  setUpFullChat({
    type: 'group',
    owner: 'friend1',
    participants: ['username', 'friend2', 'friend5'],
    name: 'group+name+2'
  });
  setUpFullChat({
    type: 'thought',
    owner: 'username',
    participants: ['friend1'],
    name: 'thought+name'
  });
  setUpFullChat({
    type: 'thought',
    owner: 'friend1',
    participants: ['username'],
    name: 'thought+name+2'
  });

  before(function (done) {
    var self = this;
    var endpoint = config.getEndpoint('/chat/pending');
    request.get({
      url: endpoint,
      auth: validAuth,
      json: {}
    }, function (err, res, body) {
      self.err = err;
      self.res = res;
      done();
    });
  });
  it('should execute without error', function () {
    assert.ifError(this.err);
  });
  it('should return 200 status code', function () {
    assert.equal(this.res.statusCode, 200);
  });
  it('should return json content type', function () {
    assert.equal(this.res.headers['content-type'], 'application/json; charset=utf-8');
  });
  it('should return the correct number of chats', function () {
    assert.equal(this.res.body.length, 1);
    var chat = this.res.body[0];
    assert.ifError(chat.id);
    assert.ok(chat.uuid);
    assert.equal(chat.type, 'group');
    assert.equal(chat.name, 'group+name+2');
    assert.include(chat.participants, {
      username: 'username',
      name: 'my name'
    });
    assert.include(chat.participants, {
      username: 'friend2',
      name: 'friend2 name'
    });
    assert.include(chat.participants, {
      username: 'friend5',
      name: 'friend5 name'
    });
    assert.include(chat.participants, {
      username: 'friend1',
      name: 'friend1 name'
    });
    assert.equal(chat.owner, 'friend1');
  });
});