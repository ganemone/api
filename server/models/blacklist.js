var _ = require('underscore');
var async = require('async');
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var logger = require('../util/logger.js');
var usernameToJID = require('../util/usernameToJID.js');

function Blacklist(user, phones, emails) {
  this.user = user;
  this.phones = phones;
  this.emails = emails;
}

Blacklist.prototype.hasMadeRequest = function(cb) {
  var query = 'SELECT username FROM blacklist WHERE username = ?';
  var data = [this.user.username];
  db.queryWithData(query, data, function(err, result) {
    if (err) {
      return cb(new HttpError('Failed to get username from blacklist table', 500, err));
    }
    cb(null, result.length > 0);
  });
};

Blacklist.prototype.getFriends = function(cb) {
  var query = '' + 
  'SELECT username' + 
  'FROM username_phone_email' + 
  'WHERE CONCAT(ccode, phone) IN ?' + 
  '  OR phone IN ?' + 
  '  OR email IN ?';

  var data = [this.phones, this.phones, this.emails];
  db.queryWithData(query, data, function(err, rows) {
    if (err) {
      return cb(new HttpError('Failed to update roster users'), 500, err);
    }
    cb(null, _.pluck(rows, 'username'));
  });
};

Blacklist.prototype.addFriends = function(usernames, cb) {
  // Callback with false if no usernames were found
  if (usernames.length === 0) {
    return cb(null, false);
  }

  var query = 'INSERT INTO rosterusers (username, jid) VALUES (?)';
  var data = [];
  var myUsername = this.user.username;
  var myJID = usernameToJID(myUsername);
  _.each(usernames, function(username) {
    var jid = usernameToJID(username);
    data.push([username, myJID]);
    data.push([myUsername, jid]);
  });

  db.queryWithData(query, data, function(err, result) {
    if (err) {
      return cb(new HttpError('Failed to add friends though blacklist', 500, err));
    }
    cb(null, true);
  }); 
};

Blacklist.prototype.setHasMadeRequest = function(cb) {
  var query = 'INSERT INTO blacklist (username) VALUES (?)';
  var data = [this.user.username];
  db.queryWithData(query, data, function(err, result) {
    if (err) {
      return cb(new HttpError('Failed to set username in blacklist table', 500, err));
    }
    cb(null);
  });
};

Blacklist.prototype.makeRequest = function(cb) {
  var self = this;
  async.waterfall([
    this.hasMadeRequest.bind(this),
    function(hasMadeRequest, cb) {
      if (hasMadeRequest) {
        return cb(null, false);
      }
      self.getFriends(cb);
    },
    this.addFriends.bind(this),    
  ], function(err, results) {
    cb(err, results);
    self.setHasMadeRequest(function(err) {
      if (err) {
        logger.error(err);
      }
    });
  });
};

module.exports = Blacklist;