var User = require('../models/user.js');

module.exports = function(req, res, next) {

  var user = User({
    username: 'g'
  });

  res.locals.user = user;
  return next();
};
