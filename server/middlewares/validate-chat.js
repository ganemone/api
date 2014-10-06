var Chat = require('../models/chat.js');
var HttpError = require('../util/http-error.js');

// Preconditions: body parser.json middleware
// Side Effects: res.locals.chat
module.exports = function (req, res, next) {
  if (!req.body.uuid) {
    return next(new HttpError('Missing Chat UUID Parameter'));
  }

  var chat = Chat({
    uuid: req.body.uuid,
    user: res.locals.user
  });

  chat.loadFromUUID(function(err, result) {
    if (err) {
      return next(err);
    }
    if (!result) {
      return next(new HttpError('Invalid chat uuid', 406));
    }
    res.locals.chat = chat;
    return next();
  });
};