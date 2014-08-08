var config = require('./config');
var Server = require('./server');
var server = new Server(config);
server.listen();
