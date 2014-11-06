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
var LoadNames = require('../middlewares/load-names.js');

module.exports = function setRoutes(app) {
  app.get('/web', function(req, res, next) {
    res.render('test');
  });
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
    LoadFriends.second, // Loads up to second degree friends
    controllers.thoughts.index
  );
  app.get(
    '/thought/:id',
    AuthUser,
    controllers.thoughts.thought
  );
  app.get(
    '/thought/report/:id',
    AuthUser,
    controllers.thoughts.report
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
  app.post(
    '/chat/invite',
    AuthUser,
    bodyParser.json(),
    ValidateChat,
    controllers.chat.invite
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

  // -------
  // Friends
  // -------
  app.get(
    '/friends/active',
    AuthUser,
    LoadFriends.first,
    LoadNames.active,
    controllers.friends.active
  );
  app.get(
    '/friends/pending',
    AuthUser,
    LoadFriends.pending,
    LoadNames.pending,
    controllers.friends.pending
  );
};