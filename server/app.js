// External Modules
var express = require('express');
var jade = require('jade');
var url = require('url');
// Internal Modules
var setRoutes = require('./routes');
var setMiddlewares = require('./middlewares');

// Shared variables
// Constructor for Server
function Server(config) {
  // Generate and save the app
  var app = express();
  this.app = app;

  // Save the config
  this.config = config;

  // Set up middlewares
  setMiddlewares(this.app);

  // Set up routes
  setRoutes(this.app);

  // Set up views
  this.app.engine('jade', jade.__express);
  this.app.set('view engine', 'jade');
  this.app.set('views', './server/views');

  // Set up error handler
  app.use(errorHandler);
}

// Shared error handler.
// TODO - log unexpected errors to Kafka
function errorHandler(err, req, res, next) {
var env = process.env.NODE_ENV || 'development';
  if(err) {
    if(err.statusCode) {
      // Log 500 errors
      if (err.statusCode >= 500) {
        console.error('Internal Server Error: ', { error: err, req: req });
      }
      // Redirect if err contains redirect path
      if (err.redirect) {
        req.query.message = err.message; 
        var redirectURL = url.format({
          pathname: err.redirect,
          query: req.query
        });
        return res.redirect(redirectURL);
      }
      // Handle all other errors
      res.status(err.statusCode);
      return res.end(err.message);
    } else {
      // Throw unexpected errors
      if(env === 'development' || env === 'local') {
        throw err;
      }
    }
  }
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
