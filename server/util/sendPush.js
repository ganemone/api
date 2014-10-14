var _ = require('underscore');
var gcm = require('node-gcm');
var apn = require('apn');
var logger = require('./logger.js');
var config = require('../../config/index.js');
var connection = new apn.Connection(config.apn);

var options = {
  "batchFeedback": true,
  "interval": 300
};

var feedback = new apn.Feedback(options);

feedback.on("feedback", function (devices) {
  devices.forEach(function (item) {
    logger.info('Feedback Item: ', item);
  });
});


function getConnection() {
  var connection = new apn.Connection(config.apn);
  connection.on('error', function (error) {
    logger.error('Apn Connection Error: ', error);
  });

  // connection.on('transmitted', function (notification, device) {
  //   logger.info('Finished sending notification', {
  //     notification: notification,
  //     device: device
  //   });
  // });

  connection.on('transmissionError', function (errorCode, notification, device) {
    logger.error('APN Transmission Error: ', {
      code: errorCode,
      notification: notification,
      device: device
    });
  });

  // connection.on('connected', function (openSockets) {
  //   logger.info('APN Connected with open sockets: ', openSockets);
  // });

  // connection.on('disconnected', function (openSockets) {
  //   logger.info('APN Disconnected: ', openSockets);
  // });
  return connection;
}

function sendPush(user, data, cb) {
  cb = cb || function noop() {};
  console.log('Trying to send a push notification to user: ', user);
  if(!user.token) {
    console.log('Didnt load users token: ', user);
    return cb();
  };
  user.getDeviceInfo(function (err) {
    if (user.hasAndroid()) {
      return sendAndroidPush(user, data, cb);
    } else if (user.hasIOS()) {
      return sendIOSPush(user, data, cb);
    }
    return cb(null, false);
  });
}

function sendAndroidPush(user, data, cb) {
  var message = new gcm.Message({
    delayWhileIdle: true,
    data: data
  });

  var sender = new gcm.Sender(config.gcm);
  console.log('Config gcm: ', config.gcm);
  var registrationIds = [user.token];

  sender.send(message, registrationIds, 3, cb);
}

function sendIOSPush(user, data, cb) {
  console.log('Sending push to user: ', user);
  var myDevice = new apn.Device(user.token);
  var note = new apn.Notification();

  note.sound = 'chime';
  note.alert = data.message;
  data = _.omit(data, 'message');
  note.payload = data;
  var connection = getConnection();
  connection.pushNotification(note, myDevice);
  connection.shutdown();
}

exports.testThoughtPush = function () {
  var myDevice = new apn.Device('10241f98315e87516232cc6acc32963539a6df1969e52fd5a9a1c4e9b4c64e17');
  var note = new apn.Notification();

  note.sound = 'chime';
  note.alert = 'Your thought was favorited';
  note.payload = {
    cid: '40'
  };
  var connection = getConnection();
  connection.pushNotification(note, myDevice);
  connection.shutdown();
};

exports.test = function() {
  sendAndroidPush({ username: 'g', token: 'APA91bG7ezLLl1td_T7SOU1SU4QWZFdfrkV9ySj3q5XCc7rbsVbfhEpdNrNaPTNqajwIoqovtieK6GlGFt6JPpp-0D5_Tecg9DGLXipVYFnzAnfxLXVwUAqNA923RmXVw6T5zbU2AS2blikdeuFuua7S_jd-poNIGw'}, { message: 'Test message', type: 'invitation'}, function(err, result) {
    console.log('Send GCM Error: ', err);
    console.log('Result: ', result);
});
}
exports.withData = sendPush;
exports.toAndroid = sendAndroidPush;
exports.toIOS = sendIOSPush;
