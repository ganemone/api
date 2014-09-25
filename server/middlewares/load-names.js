var async = require('async');
var _ = require('underscore');
var parseString = require('xml2js').parseString;
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');

exports.active = function(req, res, next) {
  var user = res.locals.user;
  getVCardFromUsernames(user.friends, function(err, result) {
    if (err) {
      return next(err);
    }
    res.locals.activeFriends = result;
    return next();
  });
};

exports.pending = function(req, res, next) {
  var user = res.locals.user;
  getVCardFromUsernames(user.pendingFriends, function(err, result) {
    if (err) {
      return next(err);
    }
    res.locals.pendingFriends = result;
    return next();
  });
};

function getVCardFromUsernames(usernames, cb) {
  if (usernames.length === 0) {
    return cb(null, []);
  }
  var query = 'SELECT * FROM vcard WHERE username IN (?)';
  var data = [usernames];
  db.queryWithData(query, data, function(err, rows) {
    if(err) {
      return cb(new HttpError('Failed to load vcards', 500, err));
    }
    parseVCards(rows, cb);
  });
}

function parseVCards(rows, cb) {
  var fns = _.map(rows, function(row) {
    return parseVCard(row);
  });
  async.parallel(fns, cb);
}

function parseVCard(row) {
  return function (cb) {
    parseString(row.vcard, function(err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, {
        username: row.username,
        name: result.vCard.FN[0]
      });
    });
  };
}