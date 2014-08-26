var config = require('./config');
var Server = require('./server/app.js');
var server = new Server(config);
console.log('-------- starting server --------');
server.listen();
