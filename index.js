process.title = 'nodejs-api';
process.on('uncaughtException', function (err) {
  console.log('Uncaught Error: ', err);
});
var config = require('./config');
var Server = require('./server/app.js');
var server = new Server(config);
server.listen();
