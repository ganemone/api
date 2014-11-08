var _ = require('underscore');
var db = require('../db/index');

exports.all = function(req, res, next) {
  db.Message.findAll({
    where: {
      chat_uuid: req.params.id
    }
  }).then(function(messages) {
    var mapFunc = getConvertMessageFunction(res.locals.user.username);
    var mappedMessages = _.map(messages, mapFunc);
    return res.json(mappedMessages);
  }).catch(function(err){
    return next(err);
  });
};

function getConvertMessageFunction(username) {
  return function convertMessageFunc(message) {
    message = message.dataValues;
    return {
      body: message.body,
      chatID: message.chat_uuid,
      id: message.id,
      imageURL: message.image_url,
      isMine: (username === message.sender_username)
    };
  };
}
