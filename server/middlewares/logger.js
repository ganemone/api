var logger = require('../util/logger.js');

module.exports = function(req, res, next) {
  logger.info('Received request at: ', req.path);
  logger.info('Request method: ', req.method);
  return next();
};
