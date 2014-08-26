var config = require('../../config');
var logger = require('./logger');

module.exports = function(server) {
  if (config.logRequests === true) {
    server.use(logger);
  }
};
