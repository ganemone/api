var controllers = require('../controllers');
var AuthPasswordKey = require('../middlewares/auth-password-key.js');
var AuthEmail = require('../middlewares/auth-email.js');
var ValidatePassword = require('../middlewares/validate-password.js');

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
  
};
