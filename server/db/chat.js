var S = require('sequelize');
module.exports = function(sequelize){
  var Chat = sequelize.define('chat', {
    uuid: {
      type: S.STRING,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: S.STRING,
      allowNull: false
    },
    owner_id: {
      type: S.STRING,
      allowNull: false
    },
    name: {
      type: S.STRING
    },
    created: {
      type: S.DATE
    },
    degree: {
      type: S.INTEGER
    },
    cid: {
      type: S.INTEGER
    }
  }, {
    tableName: 'chat'
  });
  return Chat;
};