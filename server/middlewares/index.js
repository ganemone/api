var config = require('../../config');
// Middlewares
var logger = require('./logger');
var message = require('./message.js');

module.exports = function(server) {
  if (config.logRequests === true) {
    server.use(logger);
  }
  server.use(message);
};
