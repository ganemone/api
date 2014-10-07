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

ChatCollection.prototype.toJSON = function(cb) {
  return _.map(this.chats, function(chat) {
    return chat.toJSON();
  });
};

module.exports = function(chats) {
  return new ChatCollection(chats);
};