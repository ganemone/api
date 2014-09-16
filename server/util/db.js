var mysql = require('mysql');
var config = require('../../config');
var pool  = mysql.createPool(config.db);

exports.queryWithData = function(query, data, cb) {
  var sql = mysql.format(query, data);
  
  pool.query(sql, function(err, rows, fields) {
    if (err) {
      console.log('SQL:', sql);    
    }
    cb(err, rows);
  });
};

exports.directQuery = function(query, cb) {
  pool.query(query, function(err, rows, fields) {
    if (err) {
      console.log('Query:', query);
    }
    cb(err, rows);
  });
};

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

