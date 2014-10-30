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
      test: function() {
        console.log(this);
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
            if(!user.session) {
              return false;
            }
            if(user.session.session_key !== sessionID) {
              return false;
            }
            return true;
          });
      }
    }
  });
  return User;
};