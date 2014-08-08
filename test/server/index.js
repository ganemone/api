// External Modules
var expect = require('chai').expect;
var request = require('request');
var url = require('url');

// Internal Modules
var config = require('../../config');
var runServer = require('../util/runServer.js');

// Shared variables
var baseURL = url.format(config.url);


describe('A server', function () {

  runServer();

  it('should respect the health endpoint', function (done) {
    var _url = url.resolve(baseURL, 'health');
    request.get(_url, function(err, response, body) {
      expect(err).to.be.null;
      expect(response.statusCode).to.equal(200);
      expect(body).to.equal('OK');
      done();
    });
  });
});