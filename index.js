process.title = 'nodejs-api';

var config = require('./config');
var Server = require('./server/app.js');
var server = new Server(config);
server.listen();
