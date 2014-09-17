var bodyParser = require('body-parser');
var controllers = require('../controllers');
var AuthPasswordKey = require('../middlewares/auth-password-key.js');
var AuthEmail = require('../middlewares/auth-email.js');
var AuthUser = require('../middlewares/auth-user.js');
//var MockAuthUser = require('../middlewares/mock-auth-user.js');
var ValidatePassword = require('../middlewares/validate-password.js');
var ValidateBlacklist = require('../middlewares/validate-blacklist.js');
var LoadFriends = require('../middlewares/load-friends.js');


module.exports = function setRoutes(app) {
  app.get('/health', controllers.health.index);

  // Forgot Password
  app.get(
    '/password/forgot',  
    AuthPasswordKey, 
    controllers.forgotPassword.index
  );

  app.get(
    '/password/reset', 
    AuthPasswordKey, ValidatePassword, 
    controllers.forgotPassword.reset
  );
  app.get(
    '/password/forgot/trigger/:email', 
    AuthEmail,   
    controllers.forgotPassword.trigger
  );
  app.get(
    '/password/forgot/confirmation', 
    // No Custom Middleware
    controllers.forgotPassword.confirmation
  );

  // Thoughts
  app.get(
    '/thoughts',
    AuthUser,
    LoadFriends,
    controllers.thoughts.index
  );

  app.post(
   '/blacklist',
   AuthUser,
   bodyParser.json(),
   ValidateBlacklist,
   controllers.blacklist.index
  );

  // app.get(
  //   '/mock/thoughts',
  //   MockAuthUser,
  //   LoadFriends,
  //   controllers.thoughts.index
  // );
  
};
