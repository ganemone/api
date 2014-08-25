var mysql = require('mysql');
var config = require('../../config');
var pool  = mysql.createPool(config.db);

exports.queryWithData = function(query, data, cb) {
  var sql = mysql.format(query, data);
  console.log('-------- sql --------');
  console.log(sql);
  pool.query(sql, cb);
};

exports.directQuery = function(query, cb) {
  pool.query(query, cb);
};

