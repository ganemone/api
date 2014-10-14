var Settings = require('shallow-settings');
var nodemailer = require('nodemailer');
var url = require('url');

var config = {
  common: {
    apn: {
      key: 'certs/dev/key.pem',
      cert: 'certs/dev/cert.pem',
      passphrase: 'gtcgGTCG123menisco',
      connectionTimeout: 1000,
      errorCallback: function apnsError (err) {
        console.log('APNS Error: ', err);
      }
    },
    gcm: 'AIzaSyC7n5hHVj2GSZfhSJ0fQokK5oeCgD9Ggdc',
    url: {
      protocol: 'http',
      hostname: 'localhost'
    }
  },
  local: {
    port: 3000,
    db: {
      multipleStatements: true,
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_dev'
    },
   ip: 'harmon.dev.versapp.co',
   logRequests: true,
   transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'support@versapp.co',
        pass: 'kalamazoo2014'
      }
    }),
  },
  development: {
    port: 8052,
    db: {
      multipleStatements: true,
      connectionLimit: 10,
      host: 'gcloudsql.dev.versapp.co',
      user: 'root',
      password: 'gtcgGTCG123',
      database: 'production'
    },
    ip: 'harmon.dev.versapp.co',
    logRequests: true,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'support@versapp.co',
        pass: 'kalamazoo2014'
      }
    })
  },
  production: {
    apn: {
      key: 'certs/prod/key.pem',
      cert: 'certs/prod/cert.pem',
      passphrase: 'gtcgGTCG123menisco',
      connectionTimeout: 1000,
      errorCallback: function apnsError (err) {
        console.log('APNS Error: ', err);
      }
    },
    port: 8052,
    db: {
      multipleStatements: true,
      connectionLimit: 10,
      host: 'gcloudsql.dev.versapp.co',
      user: 'root',
      password: 'gtcgGTCG123',
      database: 'production'
    },
    ip: 'versapp.co',
    logRequests: true,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'support@versapp.co',
        pass: 'kalamazoo2014'
      }
    })
  },
  test: {
    port: 3000,
    db: {
      multipleStatements: true,
      connectionLimit: 10,
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'ejabberd_test'
    },
    ip: 'harmon.dev.versapp.co',
    logRequests: false,
    transporter: {
      sendMail: function(data, cb) {
        cb(null);
      }
    }
  }
};

var settings = new Settings(config);
var env = process.env.NODE_ENV || 'development';

var config = settings.getSettings({ env: env });

config.url.port = config.port;

config.getEndpoint = function(pathname, query) {
  return url.format({
    port: config.port,
    protocol: config.url.protocol,
    hostname: config.url.hostname,
    pathname: pathname,
    query: query
  });
};

module.exports = config;
