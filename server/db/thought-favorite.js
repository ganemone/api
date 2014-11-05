var S = require('sequelize');
module.exports = function(sequelize) {
  var ThoughtFavorite = sequelize.define('confession_favorite', {
    'confession_favorite_id': {
      type: S.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'jid': {
      type: S.STRING,
      allowNull: false
    },
    'confession_id': {
      type: S.INTEGER,
      allowNull: false
    }
  });
  return ThoughtFavorite;
};