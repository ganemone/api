var HttpError = require('../util/http-error.js');
var Thought = require('../models/thought.js');
var Chat = require('../models/chat.js');

module.exports = function(req, res, next) {
  var user = res.locals.user;

  if (!req.body.type) {
    return next(new HttpError('Missing type parameter', 406));
  }

  if (!req.body.participants) {
    return next(new HttpError('Missing participants parameter', 406));
  }

  if (['121', 'group', 'thought'].indexOf(req.body.type) === -1) {
    return next(new HttpError('Invalid type parameter', 406));
  }

  if (!(req.body.participants instanceof Array)) {
    return next(new HttpError('Invalid participants parameter', 406));
  }

  if (req.body.participants.length === 0) {
    return next(new HttpError('Invalid participants parameter', 406));
  }

  if (req.body.type === 'group') {
    if (req.body.participants.length === 1) {
      return next(new HttpError('Groups must have 3 or more participants', 406));
    }
    if (!req.body.name) {
      return next(new HttpError('Groups must have a name attribute', 406));
    }
  }

  var chat = Chat({
    type: res.body.type,
    participants: res.body.participants,
    owner: user.username,
    name: req.body.name
  });

  res.locals.chat = chat;

  if (req.body.type === 'thought') {
    if (!req.body.cid) {
      return next(new HttpError('Missing a cid parameter', 406));
    }
    var thought = new Thought(req.body.cid);
    return thought.load(function(err, exists) {
      if (err) {
        return next(err);
      }
      if (!exists) {
        return next(new HttpError('Requested thought does not exist', 406));
      }
      res.locals.thought = thought;
      return next();
    });
  }
  return next();
};