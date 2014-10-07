var async = require('async');
var _ = require('underscore');

function ChatCollection(chats) {
  this.chats = chats;
}

ChatCollection.prototype.loadParticipants = function(cb) {
  var fns = _.map(this.chats, function(chat) {
    return chat.loadParticipants.bind(chat);
  });
  async.parallel(fns, cb);
};

ChatCollection.prototype.loadParticipantsNames = function(cb) {
  var fns = _.map(this.chats, function(chat) {
    return chat.loadParticipantsNames.bind(chat);
  });
  async.parallel(fns, cb);
};

ChatCollection.prototype.loadParticipantsNamesIfGroup = function(cb) {
  var groups = _.filter(this.chats, function(chat) {
    return chat.isGroup();
  });
  var fns = _.map(groups, function(chat) {
    return chat.loadParticipantsNames.bind(chat);
  });
  async.parallel(fns, cb);
};

ChatCollection.prototype.loadParticipantsNamesIf121 = function(cb) {
  var one21 = _.filter(this.chats, function(chat) {
    return chat.is121();
  });
  var fns = _.map(one21, function(chat) {
    return chat.loadParticipantsNames.bind(chat);
  });
  async.parallel(fns, cb);
};

ChatCollection.prototype.toJSON = function(cb) {
  return _.map(this.chats, function(chat) {
    return chat.toJSON();
  });
};

module.exports = function(chats) {
  return new ChatCollection(chats);
};