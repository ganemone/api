var config = require('../../config/index.js');
var winston = require('winston');
var env = process.env.NODE_ENV || 'development';

if (env === 'production' || env === 'development') {
  winston.add(winston.transports.File, { 
    filename: './log/api.log',
    handleExceptions: true
  });
}

if (!config.logRequests) {
  winston.remove(winston.transports.Console);
}

module.exports = winston;
