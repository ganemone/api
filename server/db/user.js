var S = require('sequelize');
module.exports = function(sequelize) {
  var User = sequelize.define('user', {
    username: {
      type: S.STRING,
      allowNull: false,
      primaryKey: true
    },
    password: S.STRING
  });
  return User;
}