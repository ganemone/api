var config = require('../../config');
var Server = require('../../server/app');

module.exports = function() {
  before(function () {
    this.server = new Server(config);
    this.server.listen();
  });

  after(function () {
    this.server.destroy();
  });
};
