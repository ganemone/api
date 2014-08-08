// External Modules
var express = require('express');
// Internal Modules
var setRoutes = require('./routes');
// Shared variables
// Constructor for Server
function Server(config) {
  // Generate and save the app
  var app = express();
  this.app = app;

  // Save the config
  this.config = config;

  // Logging middleware
  //this.app.all('*', function(req, res, next) {
  //  console.log('-------- RECIEVED REQUEST --------');
  //  console.log('-------- req.path --------');
  //  console.log(req.path);
  //  return next();
  //});

  // Set up routes
  setRoutes(this.app);

  // Set up error handler
  app.use(errorHandler(this.config));
}

// Shared error handler.
// TODO - log unexpected errors to Kafka
function errorHandler(config) {
  return function errorHandlerFunc(err, req, res, next) {
    if(err) {
      console.error('Shared error handler received error: ', { error: err, req: req });
      var statusCode = err.statusCode;
      if(statusCode) {
        res.status(err.statusCode);
        return res.end(err.message);
      } else {
        // Throw unexpected errors
        if(env === 'development' || env === 'local') {
          throw err;
        }
      }
    } else {
      return next();
    }
  };
}

// Sets up the server to listen on the port
// given in the config.
Server.prototype.listen = function() {
  var urlConfig = this.config.url;
  this._app = this.app.listen(urlConfig.port);
  console.info('Server listening on port: ' + urlConfig.port);
};

// Tears down the server
Server.prototype.destroy = function(cb) {
  cb = cb || function() {};

  // Close the server
  this._app.close(cb);
};

module.exports = Server;
