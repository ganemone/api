var async = require('async');
var db = require('../../server/util/db');
var User = require('../../server/models/user');

module.exports = function(data) {
  var user = new User(data);

  before(function (done) {
    async.parallel([
      function(cb) {
        user.insert(cb);
      },
      function(cb) {
        user.insertSession(cb);
      },
      function(cb) {
        if (user.passwordKey) {
          user.insertPasswordKey(cb);
        } else {
          cb(null, true);
        }
      },
    ],
    function(err, results) {
      done();
    });
  });

  after(function (done) {
    user._cleanUpAll(done);
  });
};
