// External Modules
var assert = require('assert');
var request = require('request');

// Internal Modules
var config = require('../../config/index.js');
var runServer = require('../util/runServer.js');
var setUpUser = require('../util/setup-user.js');
var setUpThoughts = require('../util/setUpThoughts.js');
var setUpRosterUsers = require('../util/setup-rosterusers.js');

// Shared variables
var validAuth = { username: 'username', password: 'sessionID' };

function setUp() {
  setUpUser({ username: 'username', password: 'password', sessionID: 'sessionID' });
  // Set up friends
  setUpRosterUsers('username', ['friend1', 'friend2', 'thirdfirstdegree']);
  setUpRosterUsers('friend1', ['friend2', 'friend3']);
  setUpRosterUsers('friend2', ['friend3', 'friend4']);
  setUpRosterUsers('friend3', ['someguy', 'anotherguy']);
}

function setUpMyThoughts() {
  setUpThoughts('username');
  setUpThoughts('username');
}

function setUpFriendsThoughts() {
  setUpThoughts('friend1');
  setUpThoughts('friend2');
}

function setUpSecondDegreeThoughts() {
  setUpThoughts('friend3');
  setUpThoughts('friend4');
}

function setUpGlobalThoughts() {
  setUpThoughts('someguy');
  setUpThoughts('anotherguy');
  setUpThoughts('thisdude');
}

describe('Integrations of /thoughts', function () {
  runServer();
  describe('something', function () {
    setUp();
    setUpMyThoughts();
    setUpFriendsThoughts();
    setUpSecondDegreeThoughts();
    setUpGlobalThoughts();
    before(function (done) {
      var self = this;
        request.get({
        url: config.getEndpoint('/thoughts'),
        auth: validAuth,
        json: {}
      }, function(err, res) {
        self.err = err;
        self.res = res;
        done();
      });
    });
    it('should execute without error', function () {
      assert.ifError(this.err);
    });
    it('should return 200 status code', function () {
      assert.equal(this.res.statusCode, 200);
    });
    it('should return json content type', function () {
      assert.equal(this.res.headers['content-type'], 'application/json; charset=utf-8');
    });
    it('should return thoughts', function () {
      console.log(this.res.body);
      assert.equal(this.res.body.length, 9);
    });
  });
});