var User = require('../models/user.js');

module.exports = function(req, res, next) {

  var user = new User({
    username: 'g' 
  });

  res.locals.user = user;
  return next();
};
