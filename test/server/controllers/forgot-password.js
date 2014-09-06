// External Modules
var expect = require('chai').expect;
var request = require('request');

// Internal Modules
var config = require('../../../config');
var User = require('../../../server/models/user');
var runServer = require('../../util/runServer');
var setUpUser = require('../../util/setup-user');

// Shared variables
var forgotURL = config.getEndpoint('/password/forgot');
var resetURL = config.getEndpoint('/password/reset');
var triggerURL = config.getEndpoint('/password/forgot/trigger');

describe('A forgot password controller', function () {

  runServer();

  it('should reject unauthenticated requests to /password/forgot', function (done) {
    request.get(forgotURL, function(err, res) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('should reject unauthenticated requests to /password/reset', function (done) {
    request.get(resetURL, function(err, res) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('should reject invalid requests to /password/trigger', function (done) {
    request.get(triggerURL, function(err, res) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(404);
      done();
    })
  });

  describe('when receiving valid requests', function () {
    var userData = {
      username: 'username',
      password: 'password',
      sessionID: 'session'
    };

    setUpUser(userData);

    it('should return an empty body /password/forgot/trigger/email', function (done) {
      request.get(triggerURL + '/username', function(err, response, body) {
        expect(err).to.not.be.ok;
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal('');
        done();
      });
    });

    it('should render /password/forgot', function (done) {
      var user = new User(userData);
      user.loadPasswordKey(function(err, result) {
        var validEndpoint = config.getEndpoint('/password/forgot', {
          username: user.username,
          key: user.passwordKey
        });  
        request.get(validEndpoint, function(err, response, body) {
          expect(err).to.not.be.ok;
          expect(response.statusCode).to.equal(200);
          expect(body).to.contain(userData.username);
          expect(body).to.contain(userData.passwordKey);
          done();
        });
      });
    });
  });
});