var HttpError = require('../util/http-error.js');
var Chat = require('../models/chat.js');
var ValidateCreateGroup = require('./validate-create-group.js');
var ValidateCreateThought = require('./validate-create-thought.js');

module.exports = function(req, res, next) {
  var user = res.locals.user;
  if (!req.body.type) {
    return next(new HttpError('Missing type parameter', 406));
  }

  if (['121', 'group', 'thought'].indexOf(req.body.type) === -1) {
    return next(new HttpError('Invalid type parameter', 406));
  }

  if (req.body.type !== 'thought') {
    if (!req.body.participants) {
      return next(new HttpError('Missing participants parameter', 406));
    }

    if (!(req.body.participants instanceof Array)) {
      return next(new HttpError('Invalid participants parameter', 406));
    }

    if (req.body.participants.length === 0) {
      return next(new HttpError('Invalid participants parameter', 406));
    }
  }

  var chat = Chat({
    type: req.body.type,
    participants: req.body.participants,
    owner: user.username,
    name: req.body.name,
    user: res.locals.user
  });

  res.locals.chat = chat;

  if (req.body.type === 'group') {
    return ValidateCreateGroup(req, res, next);
  }
  if (req.body.type === 'thought') {
    return ValidateCreateThought(req, res, next);
  }
  return next();
};