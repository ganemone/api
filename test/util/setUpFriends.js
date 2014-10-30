var db = require('../../server/db/index');

module.exports = function(user1, user2, status) {
  before(function(done) {
    var self = this;
    db.Friend
      .build({
        user_username: user1,
        friend_username: user2,
        status: status
      })
      .save()
      .then(function(friend1) {
        self.friend1 = friend1;
        return db.Friend
          .build({
            user_username: user2,
            friend_username: user1,
            status: status
          })
          .save();
      })
      .then(function(friend2) {
        self.friend2 = friend2;
        done();
      });
  });
  after(function (done) {
    db.Friend
      .destroy()
      .then(function() {
        done();
      });
  });
};