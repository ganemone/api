var controllers = require('../controllers');

module.exports = function setRoutes(app) {
  app.get('/health', controllers.health.index);
  app.get('/forgot-password', controllers.forgotPassword.index);
};
