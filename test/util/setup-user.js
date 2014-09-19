var async = require('async');
var User = require('../../server/models/user');

module.exports = function(data) {
  var user = User(data);
  before(function (done) {
    async.parallel([
      user.insert.bind(user),
      function(cb) {
        if (user.sessionID) {
          return user.insertSession(cb);
        }
        cb(null, true);
      },
      function(cb) {
        if (user.passwordKey) {
          return user.insertPasswordKey(cb);
        }
        cb(null, true);
      },
      function(cb) {
        if (user.email) {
          return user.insertInfo(cb);
        }
        cb(null, true);
      }
    ],
    function(err, results) {
      done();
    });
  });

  after(function (done) {
    user._cleanUpAll(done);
  });
};
