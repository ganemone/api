var S = require('sequelize');
module.exports = function(sequelize) {
  var User = sequelize.define('user', {
    username: {
      type: S.STRING,
      allowNull: false,
      primaryKey: true
    },
    password: S.STRING
  }, {
    instanceMethods: {
      getActiveFriends: function() {
        return this.getFriends({
          where: {
            status: 'friends'
          }
        });
      },
      getPendingFriends: function() {
        return this.getFriends({
          where: {
            status: 'pending'
          }
        });
      },
      getRequestedFriends: function() {
        return this.getFriends({
          where: {
            status: 'requested'
          }
        });
      },
      getWasRejectedFriends: function() {
        return this.getFriends({
          where: {
            status: 'was_rejected'
          }
        });
      },
      getDidRejectFriends: function() {
        return this.getFriends({
          where: {
            status: 'did_reject'
          }
        });
      }
    },
    classMethods: {
      isAuthenticatedUser: function(username, sessionID) {
        return this
          .find({
            where: {
              username: username,
            },
            include: [
              this.associations.session.target
            ]
          })
          .then(function(user) {
            if (!user) {
              return false;
            }
            if (!user.session) {
              return false;
            }
            if (user.session.session_key !== sessionID) {
              return false;
            }
            return true;
          });
      }
    }
  });
  return User;
};