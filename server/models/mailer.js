var config = require('../../config/index.js');
var transporter = config.transporter;

function Mailer(from) {
  this.from = from;
}

Mailer.prototype.send = function(to, subject, text, cb) {
  var from = this.from;
  transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    text: text
  }, function(err, info) {
    cb(err);
  });
};

Mailer.prototype.sendPasswordKeyEmail = function(user, cb) {
  var message = 'Greetings from Versapp\n\n';
  message+= 'Please click on the following link to reset your password. If you did not want to reset your password, simply ignore this email.\n\n';
  message+= user.getPasswordResetLink();

  var to = user.email;
  var from = 'support@versapp.co';
  var subject = 'Versapp Password Reset';

  this.from = from;
  this.send(to, subject, message, cb);
};

module.exports = Mailer;