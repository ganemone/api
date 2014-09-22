// External Modules
var express = require('express');
var url = require('url');
var logger = require('../../server/util/logger.js');
// Constructor for Server
function MockEjabberdServer() {
  // Generate and save the app
  var app = express();
  this.app = app;

  this.app.get('/', function(req, res) {
    res.send('OK');
  });

  this.app.get('/notify/new_group', function(req, res, next) {
    res.send('OK');
  });
}

MockEjabberdServer.prototype.listen = function(port) {
  this._app = this.app.listen(port);
  logger.info('MockEjabberdServer listening on port: ' + port);
};

// Tears down the MockEjabberdServer
MockEjabberdServer.prototype.destroy = function(cb) {
  cb = cb || function() {};
  this._app.close(cb);
};

module.exports = MockEjabberdServer;
