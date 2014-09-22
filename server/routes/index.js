var bodyParser = require('body-parser');
var controllers = require('../controllers');
var AuthPasswordKey = require('../middlewares/auth-password-key.js');
var AuthEmail = require('../middlewares/auth-email.js');
var AuthUser = require('../middlewares/auth-user.js');
var ValidatePassword = require('../middlewares/validate-password.js');
var ValidateBlacklist = require('../middlewares/validate-blacklist.js');
var ValidateCreateChat = require('../middlewares/validate-create-chat.js');
var ValidateChat = require('../middlewares/validate-chat.js');
var LoadFriends = require('../middlewares/load-friends.js');


module.exports = function setRoutes(app) {
  app.get('/health', controllers.health.index);

  // ---------------
  // Forgot Password
  // ---------------
  app.get(
    '/password/forgot',
    AuthPasswordKey,
    controllers.forgotPassword.index
  );
  app.get(
    '/password/forgot/reset',
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
  // --------
  // Thoughts
  // --------
  app.get(
    '/thoughts',
    AuthUser,
    LoadFriends,
    controllers.thoughts.index
  );
  // --------
  // Blacklist
  // --------
  app.post(
   '/blacklist',
   AuthUser,
   bodyParser.json(),
   ValidateBlacklist,
   controllers.blacklist.index
  );
  // ------
  // Chat
  // ------
  app.post(
    '/chat/create',
    AuthUser,
    bodyParser.json(),
    ValidateCreateChat,
    controllers.chat.create
  );
  app.post(
    '/chat/leave',
    AuthUser,
    bodyParser.json(),
    ValidateChat,
    controllers.chat.leave
  );
  app.post(
    '/chat/join',
    AuthUser,
    bodyParser.json(),
    ValidateChat,
    controllers.chat.join
  );
  app.get(
    '/chat/joined',
    AuthUser,
    controllers.chat.joined
  );
  app.get(
    '/chat/pending',
    AuthUser,
    controllers.chat.pending
  );

};
