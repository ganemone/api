var S = require('sequelize');
var config = require('../../config/index');
var sequelize = new S(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
);

var User = require('./user')(sequelize);
var Thought = require('./thought')(sequelize);
var Friend = require('./friend')(sequelize);
var Session = require('./session')(sequelize);

User.hasMany(Friend, {
  as: 'Friends',
  onDelete: 'cascade'
});

User.hasMany(Thought, {
  as: 'Thoughts',
  foreignKey: {
    name: 'jid'
  }
});

User.hasOne(Session, {
  onDelete: 'cascade',
  foreignKey: {
    name: 'username'
  }
});

//sequelize.sync().then(function() {
//});

exports.User = User;
exports.Thought = Thought;
exports.Friend = Friend;