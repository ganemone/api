var logger = require('../util/logger.js');

module.exports = function(req, res, next) {
  logger.log('Received request at: ', req.path);
  logger.log('Request method: ', req.method);
  return next();
};
