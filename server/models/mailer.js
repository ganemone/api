var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ganemone@gmail.com',
    pass: 'meniscotherium'
  }
});

function Mailer(from) {
  this.from = from;
}

Mailer.prototype.send = function(to, subject, text, cb) {
  console.log('Sending...');
  transporter.sendMail({
    from: 'ganemone@gmail.com',
    to: 'ganemone@gmail.com',
    subject: 'SUBJECT',
    text: 'This is an email. I am sending it from a node server' 
  }, function(err, info) {
    console.log('err', err);
    console.log('info', info);
    cb(err);
  });
};

Mailer.prototype.sendPasswordKeyEmail = function(user, cb) {
  console.log('Inside sending email');
  var message = 'Greetings from Versapp\n\n';
  message+= 'Please click on the following link to reset your password. If you did not want to reset your password, simply ignore this email.\n\n';
  message+= user.getPasswordResetLink();

  var to = user.email;
  var from = 'noreply@versapp.co';
  var subject = 'Versapp Password Reset';

  this.from = from;
  this.send(to, subject, message, cb);
};

module.exports = Mailer;