var S = require('sequelize');
module.exports = function(sequelize) {
  var Thought = sequelize.define('confession', {
    confession_id: {
      type: S.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    jid: {
      type: S.STRING,
      allowNull: false
    },
    body: S.TEXT,
    image_url: S.STRING,
    created_timestamp: S.DATE
  });
  return Thought;
}