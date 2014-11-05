var xmpp = require('node-xmpp-client');
var client = new xmpp.Client({
  jid: 'testuser',
  password: 'password',
  host: 'versapp.co',
  port: 4222
});

client.addListener('online', function(data) {
  console.log('Connected!: ', data);
  var message = new xmpp.Element('message', {
    to: 'd194ba04-1f84-421f-b935-5c19df244da5',
    'type': 'chat'
  }).c('body').t('some message body');
  client.send(message);
  client.end();
});

client.addListener('error', function(error) {
  console.error(error);
  process.exit(1);
});
