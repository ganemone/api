var Settings = require('shallow-settings');

var config = {
  common: {
    url: {
      port: 3000,
      protocol: 'http',
      hostname: 'localhost'
    }
  },
  development: {
    db: {
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_dev'
    },
   logRequests: true
  },
  production: {
    db: {
      // TODO: set up production db
    },
    logRequests: false
  },
  test: {
    db: {
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_dev'
    },
    logRequests: false
  }
};

var settings = new Settings(config);
var env = process.env.NODE_ENV || 'development';

module.exports = settings.getSettings({ env: env });
