var _ = require('underscore');
var async = require('async');
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var usernameToJID = require('../util/usernameToJID.js');

function Blacklist(user, phones, emails) {
  this.user = user;
  this.phones = phones;
  this.emails = emails;
}

Blacklist.prototype.hasMadeRequest = function(cb) {
  var query = 'SELECT username FROM blacklist WHERE username = ?';
  var data = [this.user.username];
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(new HttpError('Failed to get username from blacklist table', 500, err));
    }
    cb(null, rows.length > 0);
  });
};

Blacklist.prototype.getFriends = function(cb) {
  var query = '' +
  'SELECT username ' +
  'FROM username_phone_email ' +
  'WHERE ';
  var data = [];
  if (this.phones.length > 0) {
    query += 'CONCAT(ccode, phone) IN (?) OR phone IN (?) ';
    data.push(this.phones);
    data.push(this.phones);
  }
  if (this.emails.length > 0) {
    query += 'OR email IN (?)';
    data.push(this.emails);
  }

  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      console.error(err);
      return cb(new HttpError('Failed to find friends'), 500, err);
    }
    if (rows.length === 0) {
      return cb(null, []);
    }
    cb(null, _.pluck(rows, 'username'));
  });
};

Blacklist.prototype.addFriends = function(usernames, cb) {
  // Callback with false if no usernames were found
  if ((usernames.length > 0) === false) {
    return cb(null, false);
  }
  var query = 'INSERT INTO rosterusers (username, jid, subscription, nick, ask, askmessage, server, subscribe, type) VALUES ?';
  var data = [];
  var myUsername = this.user.username;
  var myJID = usernameToJID(myUsername);
  _.each(usernames, function(username) {
    var jid = usernameToJID(username);
    data.push([username, myJID, 'B', '', 'N', '', 'N', '', 'item']);
    data.push([myUsername, jid, 'B', '', 'N', '', 'N', '', 'item']);
  });
  db.queryWithData(query, [data], function(err, result) {
    if (err) {
      return cb(new HttpError('Failed to add friends though blacklist', 500, err));
    }
    cb(null, true);
  });
};

Blacklist.prototype.setHasMadeRequest = function(cb) {
  cb = cb || function noop() {};
  var query = 'INSERT INTO blacklist (username) VALUES (?)';
  var data = [this.user.username];
  db.queryWithData(query, data, function(err, result) {
    if (err) {
      return cb(new HttpError('Failed to set username in blacklist table', 500, err));
    }
    cb(null);
  });
};

Blacklist.prototype.makeRequest = function(callback) {
  var self = this;
  async.waterfall([
    this.getFriends.bind(this),
    this.addFriends.bind(this),
  ], function(err, result) {
    callback(err, result);
    self.setHasMadeRequest();
  });
};

module.exports = function(user, phones, email) {
  return new Blacklist(user, phones, email);
};