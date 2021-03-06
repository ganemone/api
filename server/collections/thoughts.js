var async = require('async');
var assert = require('assert');
var _ = require('underscore');
var format = require('mysql').format;

var createThoughtObj = require('../models/thought.js');
var db = require('../util/db.js');

function ThoughtsCollection(user, since) {
  this.user = user;
  this.sinceStr = (since > 0) ? format('AND UNIX_TIMESTAMP(confessions.created_timestamp) < ?', [since]) : '';
}

ThoughtsCollection.prototype.getThoughtsFeed = function(cb) {
  var self = this;
  async.parallel([
    this.getMyFeed.bind(this),
    function(cb) {
      if (self.user.friends.length > 2) {
        return self.getFirstDegreeFeed(cb);
      }
      return cb(null, []);
    },
    this.getSecondDegreeFeed.bind(this),
    this.getGlobalFeed.bind(this)
  ], function(err, results) {
    if (err) {
      return cb(err);
    }

    var myFeed = results[0];
    var firstDegreeFeed = results[1];
    var secondDegreeFeed = results[2];
    var globalFeed = results[3];
    var all = globalFeed.concat(myFeed, firstDegreeFeed, secondDegreeFeed);

    var sorted = _.sortBy(all, function(thought) {
      return thought.timestamp;
    });

    cb(null, sorted);
  });
};

ThoughtsCollection.prototype.getMyFeed = function(cb) {
  assert.ok(this.user.username, 'Expected user.username to be set');
  var query = this.getMyFeedQuery();
  db.directQuery(query, this.handleThoughtsFeedQuery(cb));
};

ThoughtsCollection.prototype.handleThoughtsFeedQuery = function(cb) {
  return function(err, rows) {
    if (err) {
      return cb(err);
    }
    rows = _.map(rows, function(thought) {
      return createThoughtObj(thought).toJSON();
    });
    cb(null, rows);
  };
};

ThoughtsCollection.prototype.getFirstDegreeFeed = function(cb) {
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');

  if (this.user.friends.length === 0) {
    return this.getMyFeed(cb);
  }

  var query = this.getFirstDegreeQuery();
  db.directQuery(query, this.handleThoughtsFeedQuery(cb));
};

ThoughtsCollection.prototype.getSecondDegreeFeed = function(cb) {
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');
  assert.ok(this.user.secondDegreeFriends, 'Expected user.secondDegreeFriends to be set');

  if (this.user.friends.length === 0) {
    return cb(null, []);
  }

  if (this.user.secondDegreeFriends.length === 0) {
    return cb(null, []);
  }

  var query = this.getSecondDegreeQuery();
  db.directQuery(query, this.handleThoughtsFeedQuery(cb));
};

ThoughtsCollection.prototype.getGlobalFeed = function(cb) {
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');
  assert.ok(this.user.secondDegreeFriends, 'Expected user.secondDegreeFriends to be set');

  var query = this.getGlobalQuery();
  db.directQuery(query, this.handleThoughtsFeedQuery(cb));
};

ThoughtsCollection.prototype.getMyFeedQuery = function() {
  var query = this.getSelectQuery(0) +
  ' WHERE ' +
    'confessions.jid = ?' +
    this.sinceStr +
  this.getEndQuery();

  var data = [this.user.username];

  return format(query, data);
};

ThoughtsCollection.prototype.getFirstDegreeQuery = function() {
  var query = this.getSelectQuery(1) +
  ' WHERE ' +
    'confessions.jid IN (?)' +
    this.sinceStr +
  this.getEndQuery();

  var data = [
    this.user.friends
  ];

  return format(query, data);
};

ThoughtsCollection.prototype.getSecondDegreeQuery = function() {
  var query = this.getSelectQuery(2) +
  ' WHERE ' +
    'confessions.jid IN (?) AND ' +
    'confessions.jid NOT IN (?) AND ' +
    'confessions.jid != ? ' +
    this.sinceStr +
    ' ' +
    this.getEndQuery();

  var data = [
    this.user.secondDegreeFriends,
    this.user.friends,
    this.user.username
  ];

  return format(query, data);
};

ThoughtsCollection.prototype.getGlobalQuery = function() {
  var query = this.getSelectQuery(7) + ' WHERE ';
  var data = [];
  if (this.user.friends.length > 0) {
    query = query + 'confessions.jid NOT IN (?) AND ';
    data.push(this.user.friends);
    if (this.user.secondDegreeFriends.length > 0) {
      query = query + 'confessions.jid NOT IN (?) AND ';
      data.push(this.user.secondDegreeFriends);
    }
  }
  query = query + 'confessions.jid != ? ';
  query = query + this.sinceStr + ' ';
  query = query + this.getEndQuery();

  data.push(this.user.username);

  return format(query, data);
};

ThoughtsCollection.prototype.getSelectQuery = function(degree) {
  assert.ok(this.user.username, 'Expected username to be set');
  return format('' +
    'SELECT confessions.confession_id AS id, ' +
    'confessions.body, ' +
    'confessions.image_url AS imageUrl, ' +
    'UNIX_TIMESTAMP(confessions.created_timestamp) AS timestamp, ' +
    '\''+ degree + '\' AS degree, ' +
    'CASE ' +
      'WHEN FIND_IN_SET(?, GROUP_CONCAT(confession_favorites.jid SEPARATOR \',\')) > 0 ' +
      'THEN \'true\' ' +
      'ELSE \'false\' ' +
      'END ' +
    'AS hasFavorited, ' +
    'count(confession_favorites.jid) AS numFavorites, ' +
    'count(confession_favorites.jid) * 20000 + UNIX_TIMESTAMP(confessions.created_timestamp) AS score ' +
  'FROM confessions ' +
  'LEFT JOIN confession_favorites ' +
  'ON confessions.confession_id = confession_favorites.confession_id', [this.user.username]);
};

ThoughtsCollection.prototype.getEndQuery = function() {
  return '' +
  'GROUP BY confessions.confession_id ' +
  'ORDER BY score DESC ' +
  'LIMIT 30';
};

module.exports = ThoughtsCollection;