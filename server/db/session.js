var S = require('sequelize');
module.exports = function(sequelize) {
  var Session = sequelize.define('session', {
    username: {
      type: S.STRING,
      allowNull: false,
      unique: true
    },
    session_key: S.STRING,
  });
  return Session;
};