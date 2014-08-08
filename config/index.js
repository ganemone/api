var Settings = require('shallow-settings');

var config = {
  common: {
    url: {
      port: 3000,
      protocol: 'http',
      hostname: 'localhost'
    }
  },
  development: {},
  production: {},
  test: {}
};

var settings = new Settings(config);
var env = process.NODE_ENV || 'development';

module.exports = settings.getSettings({ env: env });
