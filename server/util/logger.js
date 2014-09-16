var winston = require('winston');
var env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  winston.add(winston.transports.File, { 
    filename: './log/api.log',
    handleExceptions: true
  });
}

module.exports = winston;