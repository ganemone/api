var async = require('async');
var _ = require('underscore');
var db = require('../util/db.js');
var HttpError = require('../util/http-error.js');
var parseString = require('xml2js').parseString;
// Endpoint: /friends
// Method: GET
// Authorization: Basic
// Parameters: None
// Action: Returns a json object representing
// the users friends lists. Example return:
// [{
//    username: <username>
//    name: name
// }, ...]
exports.index = function (req, res, next) {
  var user = res.locals.user;
  getVCardFromUsernames(user.friends, function(err, result) {
    if (err) {
      return next(err);
    }
    res.json(result);
  });
};

exports.pending = function (req, res, next) {
  var user = res.locals.user;
  getVCardFromUsernames(user.pendingFriends, function(err, result) {
    if (err) {
      return next(err);
    }
    res.json(result);
  });
};

function getVCardFromUsernames(usernames, cb) {
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
