var config = require('../../config');
var Server = require('../../server/app');
var MockEjabberdServer = require('./mockEjabberdServer.js');

module.exports = function() {
  before(function () {
    this.server = new Server(config);
    this.server.listen();
    this.mockEjabberdServer = new MockEjabberdServer();
    this.mockEjabberdServer.listen(5290);
  });

  after(function () {
    this.server.destroy();
    this.mockEjabberdServer.destroy();
  });
};
