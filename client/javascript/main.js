var Client = require('node-xmpp-client');
var ltx = require('ltx');
var client = new Client({
  jid: 'testuser@versapp.co',
  password: 'password',
  host: 'versapp.co',
  preferred: 'PLAIN',
  port: 4222
});

client.addListener('online', function(data) {
  console.log('Connected!: ', data);
  var message = new ltx.Element('message', {
    to: 'd194ba04-1f84-421f-b935-5c19df244da5@versapp.co',
    'type': 'chat'
  }).c('body').t('some message body');
  client.send(message);
  client.end();
});

client.addListener('error', function(error) {
  debugger;
  console.error(error);
  process.exit(1);
});