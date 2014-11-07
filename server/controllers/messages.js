var db = require('../db/index');

exports.all = function(req, res, next) {
  db.Message.findAll({
    where: {
      chat_uuid: req.params.id
    }
  }).then(function(messages) {
    res.json(messages);
  }).catch(function(err){
    return next(err);
  });
};