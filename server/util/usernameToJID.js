var config = require('../../config/index.js');

module.exports = function(username) {
  return username + '@' + config.ip;
};