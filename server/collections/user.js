var _ = require('underscore');
var async = require('async');


var AsyncHelper = require('../util/async-helper.js');
var sendPush = require('../util/sendPush.js');
var User = require('../models/user.js');

function UserCollection(usernames) {
  this.users = loadUsers(usernames);
}

UserCollection.prototype.getDeviceInfo = function (cb) {
  var loadFns = _.map(this.users, function (user) {
    return AsyncHelper.withContext(user.getDeviceInfo, user, []);
  });
  async.parallel(loadFns, cb);
};

UserCollection.prototype._notify = function (data) {
  var self = this;
  return function notifyUsersFunc(cb) {
    var pushFns = _.map(self.users, function (user) {
      return AsyncHelper.noContext(sendPush.withData, [user, data]);
    });
    async.parallel(pushFns, cb);
  };
};

UserCollection.prototype.notify = function (data, cb) {
  cb = cb || function noop() {};
  async.series([
    this.getDeviceInfo.bind(this),
    this._notify(data).bind(this)
  ], cb);
};

function loadUsers(usernames) {
  return _.map(usernames, User);
}

module.exports = function (usernames) {
  return new UserCollection(usernames);
};