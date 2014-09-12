var Settings = require('shallow-settings');
var url = require('url');

var config = {
  common: {
    url: {
      port: 3000,
      protocol: 'http',
      hostname: 'localhost'
    },
    getEndpoint: function(pathname, query) {
      return url.format({
        port: this.url.port,
        protocol: this.url.protocol,
        hostname: this.url.hostname,
        pathname: pathname,
        query: query
      });
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
    ip: 'harmon.dev.versapp.co',
   logRequests: true
  },
  production: {
    db: {
      // TODO: set up production db
    },
    ip: 'versapp.co',
    logRequests: false
  },
  test: {
    db: {
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_test'
    },
    ip: 'harmon.dev.versapp.co',
    logRequests: false
  }
};

var settings = new Settings(config);
var env = process.env.NODE_ENV || 'development';

module.exports = settings.getSettings({ env: env });
