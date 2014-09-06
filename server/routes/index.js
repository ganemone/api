var controllers = require('../controllers');

module.exports = function setRoutes(app) {
  app.get('/health', controllers.health.index);
  app.get('/password/forgot', controllers.forgotPassword.index);
  app.get('/password/reset', controllers.forgotPassword.reset);
  app.get('/password/forgot/trigger/:email', controllers.forgotPassword.trigger);
};
