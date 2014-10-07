var gcm = require('node-gcm');
var apn = require('apn');

var config = require('../../config/index.js');

function sendPush(user, data, cb) {
  cb = cb || function noop() {};
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
  var registrationIds = [user.token];

  sender.send(message, registrationIds, 3, cb);
}

function sendIOSPush(user, data, cb) {
  var apnConnection = new apn.Connection(config.apn);
  var myDevice = new apn.Device(user.token);
  var note = new apn.Notification();

  note.sound = "chime";
  note.alert = data.message;
  delete(data.message);
  note.payload = data;

  apnConnection.pushNotification(note, myDevice);
}

exports.withData = sendPush;
exports.toAndroid = sendAndroidPush;
exports.toIOS = sendIOSPush;