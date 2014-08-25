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
    }
  },
  production: {},
  test: {
    db: {
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_dev'
    }
  }
};

var settings = new Settings(config);
var env = process.NODE_ENV || 'development';

module.exports = settings.getSettings({ env: env });
