var assert = require('assert');
var Chat = require('../../../server/models/chat.js');
var setUpChat = require('../../util/setUpChat.js');
var cleanUpTable = require('../../util/cleanUpTable.js');
var Mock = require('../../util/mock.js');

var sharedChatData = {
  id: 1,
  type: 'type',
  owner: 'owner',
  name: 'name',
  degree: 'degree',
  participants: ['friend1', 'friend2'],
  uuid: 'uuid'
};

describe('Chat Model', function () {
  describe('load', function () {
    describe('without data', function () {
      it('should callback with false', function (done) {
        var chat = Chat(1);
        chat.load(function(err, result) {
          assert.ifError(err, 'Should execute without error');
          assert.equal(result, false);
          assert.ifError(chat.uuid, 'Expected uuid not to be set');
          assert.ifError(chat.type, 'Expected type not to be set');
          assert.ifError(chat.owner, 'Expected owner not to be set');
          assert.ifError(chat.created, 'Expected created not to be set');
          assert.ifError(chat.degree, 'Expected degree not to be set');
          done();
        });
      });
    });
    describe('with data', function () {  
      setUpChat(sharedChatData);
      it('should callback with true', function (done) {
        var chat = Chat(1);
        chat.load(function(err, result) {
          assert.ifError(err, 'Should execute without error');
          assert.equal(result, true);
          testChat(chat, sharedChatData, true);
          done();
        });
      });
    });
  });

  describe('insert', function () {
    cleanUpTable('chat');
    var chatData = {
      type: 'group',
      owner: 'owner',
      name: 'name',
      participants: ['friend1', 'friend2'],
      degree: '1'
    };
    var chat = Chat(chatData);
    it('should work', function (done) {
      chat.insert(function(err, result) {
        assert.ifError(err, 'Should execute without error');
        testChat(chat, chatData);
        chat.load(function(err, result) {
          assert.ifError(err, 'Should execute without error');
          assert.equal(result, true);
          testChat(chat, chatData, true);
          done();
        });
      });
    });
  });
  describe('insertParticipants', function () {
    cleanUpTable('chat');
    cleanUpTable('participants');
    describe('when there is no corresponding chat', function () {
      var chatData = {
        id: 1,
        type: 'group',
        owner: 'owner',
        name: 'name',
        participants: ['friend1', 'friend2'],
        degree: '1'
      };
      var chat = Chat(chatData);
      it('should fail', function (done) {
        chat.insertParticipants(function(err, result) {
            //assert.ok(err, 'Expected err to be ok');
            //assert.ifError(result, 'Should not execute query');
            done();
          });
      });
    });
    describe('when there is a corresponding chat', function () {
      var chatData = {
        id: 1,
        type: 'group',
        owner: 'owner',
        name: 'name',
        participants: ['friend1', 'friend2'],
        degree: '1'
      };
      var chat = Chat(chatData);
      it('should work', function (done) {
        chat.insert(function(err, result) {
          chat.insertParticipants(function(err, result) {
            assert.ifError(err, 'Should execute without error');
            assert.equal(result.affectedRows, chatData.participants.length);
            done();
          });
        });
      });
    });
  });
  describe('delete', function () {
    describe('when not affecting a row', function () {
      it('should return false when not affecting a row', function (done) {
        var chat = new Chat(1);
        chat.deleteFromID(function(err, result) {
          assert.ifError(err);
          assert.equal(result, false);
          done();
        });
      });  
    });
    describe('when affecting a row', function () {
      setUpChat(sharedChatData);
      it('should return true when affecting a row', function () {
        var chat = new Chat(1);
        chat.deleteFromID(function(err, result) {
          assert.ifError(err);
          assert.equal(result, true);
        });
      });
    });
    it('should handle errors correctly', function () {
      var mockQueryWithData = new Mock(function(query, data, cb) {
        cb(new Error('Some error'));
      });
      var mockDB = {
        queryWithData: mockQueryWithData.getFn()
      };
      var chat = new Chat(1);
    });
  });
});

function testChat(chat, chatData, withCreated) {
  assert.equal(typeof chat.uuid, 'string');
  assert.equal(chat.type, chatData.type);
  assert.equal(chat.owner, chatData.owner);
  assert.equal(typeof chat.id, 'number');
  if (withCreated) {
    assert.ok(chat.created);
    var regExp = new RegExp('^[0-9]+$');
    assert.equal(regExp.test(chat.created), true);
  }
  assert.equal(chat.degree, chatData.degree);
}