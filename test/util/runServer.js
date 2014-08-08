var config = require('../../config');
var Server = require('../../server');
var server = new Server(config);

module.exports = function() {
  before(function () {
    server.listen();
  });

  after(function () {
    server.destroy();
  });
};
