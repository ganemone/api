var db = require('../../server/db/index');

module.exports = function(user) {
  before(function(done) {
    var self = this;
    db.User
      .build(user)
      .save()
      .then(function(createdUser) {
        self.user = createdUser;
        done();
      });
  });
  after(function(done) {
    db.User
      .destroy()
      .then(function() {
        done();
      });
  });
};