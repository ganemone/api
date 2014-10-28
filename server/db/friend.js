var S = require('sequelize');

function getOpposingStatus(status) {
  if (status === 'friends') {
    return status;
  } else if (status === 'pending') {
    return 'requested';
  } else if (status === 'requested') {
    return 'pending';
  } else if (status === 'was_rejected') {
    return 'did_reject';
  } else if (status === 'did_reject') {
    return 'was_rejected';
  } else {
    throw new Error('Invalid Status: ' + status);
  }
}

module.exports = function(sequelize) {
  var Friend = sequelize.define('friends', {
    friend_username: {
      type: S.STRING,
      allowNull: false
    },
    status: {
      type: S.ENUM(
        'friends',
        'requested',
        'pending',
        'was_rejected',
        'did_reject')
    }
  }, {
    timestamps: true,
    instanceMethods: {
      setStatus: function(status) {
        this.setDataValue('status', status);
        return this;
      }
    },
    classMethods: {
      addFriendsWithStatus: function(user, friend, status) {
        return Friend.findOrCreate({
          where: {
            user_username: user,
            friend_username: friend,
          }
        }).spread(function(insertedFriend, created) {
          console.log('Inserted Friend: ', insertedFriend);
          console.log('Created: ', created);
          return insertedFriend.setStatus(status).save();
        }).then(function() {
          return Friend.findOrCreate({
            where: {
              user_username: friend,
              friend_username: user
            }
          });
        }).spread(function(insertedFriend2, created) {
          return insertedFriend2.setStatus(getOpposingStatus(status)).save();
        });
      },
      makeFriends: function(user, friend) {
        return this.addFriendsWithStatus(user, friend, 'friends');
      },
      makePending: function(user, friend) {
        return this.addFriendsWithStatus(user, friend, 'pending');
      },
      makeRequested: function(user, friend) {
        return this.addFriendsWithStatus(user, friend, 'requested');
      },
      makeWasRejected: function(user, friend) {
        return this.addFriendsWithStatus(user, friend, 'was_rejected');
      },
      makeDidReject: function(user, friend) {
        return this.addFriendsWithStatus(user, friend, 'did_reject');
      }
    }
  });
  return Friend;
};