var mysql = require('mysql');
var config = require('../../config');
var pool  = mysql.createPool(config.db);
var logger = require('./logger.js');
var HttpError = require('./http-error.js');

exports.queryWithData = function(query, data, cb) {
  var sql = mysql.format(query, data);
  pool.query(sql, getQueryCB(cb, sql));
};

exports.directQuery = function(query, cb) {
  pool.query(query, getQueryCB(cb, query));
};

function getQueryCB(cb, sql) {
  return function(err, rows, fields) {
    if (err) {
      return cb(new HttpError('Internal Server Error - Failed to execute query', 500, {error: err, sql: sql}));
    }
    cb(null, rows);
  }
}

/*

Insert Queries Response:
------------------------
------------------------
{ fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0 }

Delete Query Reponse:
---------------------
---------------------

Update Query Response:
----------------------
----------------------

Select Query Response:
----------------------
----------------------



*/

