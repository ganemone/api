var async = require('async');
var assert = require('assert');
var format = require('mysql').format;
var db = require('../util/db.js');

function ThoughtsCollection(user, since) {
  this.user = user;
  this.sinceStr = (since > 0) ? format('AND confessions.created_timestamp < ?', [since]) : '';
}

ThoughtsCollection.prototype.getThoughtsFeed = function(cb) {
  async.parallel([
    this.getFirstDegreeFeed.bind(this),
    this.getSecondDegreeFeed.bind(this),
    this.getGlobalFeed.bind(this)
  ], function(err, results) {
    if (err) {
      return cb(err);
    }
    var firstDegreeFeed = results[0];
    var secondDegreeFeed = results[1];
    var globalFeed = results[2];
    var all = globalFeed.concat(firstDegreeFeed, secondDegreeFeed);
    cb(null, all);
  });
};

ThoughtsCollection.prototype.getFirstDegreeFeed = function(cb) {
  var query = this.getFirstDegreeQuery();
  db.directQuery(query, cb);
};

ThoughtsCollection.prototype.getSecondDegreeFeed = function(cb) {
  var query = this.getSecondDegreeQuery();
  db.directQuery(query, cb);
};

ThoughtsCollection.prototype.getGlobalFeed = function(cb) {
  var query = this.getGlobalQuery();
  db.directQuery(query, cb);
};

ThoughtsCollection.prototype.getFirstDegreeQuery = function() {
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');
  var query = this.getSelectQuery() + 
  ' WHERE ' + 
    'confessions.jid IN (?)' + 
    this.sinceStr +
    'OR confessions.jid = ?' + 
  this.getEndQuery();

  var data = [
    this.user.friends,
    this.user.username
  ];

  return format(query, data);
};

ThoughtsCollection.prototype.getSecondDegreeQuery = function() {
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');
  assert.ok(this.user.secondDegreeFriends, 'Expected user.secondDegreeFriends to be set');
  var query = this.getSelectQuery() + 
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
  assert.ok(this.user, 'Expected user object to be set');
  assert.ok(this.user.friends, 'Expected user.friends to be set');
  assert.ok(this.user.secondDegreeFriends, 'Expected user.secondDegreeFriends to be set');
  var query = this.getSelectQuery() + 
  ' WHERE ' + 
    'confessions.jid NOT IN (?) AND ' + 
    'confessions.jid NOT IN (?) AND ' + 
    'confessions.jid != ? ' +
    this.sinceStr + 
  ' ' + 
  this.getEndQuery();

  var data = [
    this.user.friends,
    this.user.secondDegreeFriends,
    this.user.username
  ];

  return format(query, data);
};

ThoughtsCollection.prototype.getSelectQuery = function() {
  return format('' +
    'SELECT confessions.*, ' + 
    '\'1\' AS connection, ' + 
    'CASE ' + 
      'WHEN FIND_IN_SET(?, GROUP_CONCAT(confession_favorites.jid SEPARATOR \',\')) > 0 ' + 
      'THEN \'YES\' ' + 
      'ELSE \'NO\' ' + 
      'END ' + 
    'AS has_favorited, ' + 
    'count(confession_favorites.jid) AS num_favorites ' + 
  'FROM confessions ' + 
  'LEFT JOIN confession_favorites ' +
  'ON confessions.confession_id = confession_favorites.confession_id', [this.username]); 
};

ThoughtsCollection.prototype.getEndQuery = function() {
  return '' + 
  'GROUP BY confessions.confession_id ' + 
  'ORDER BY confessions.created_timestamp DESC ' + 
  'LIMIT 30';
};

module.exports = ThoughtsCollection;