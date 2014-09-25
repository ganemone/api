var db = require('../../server/util/db.js');

module.exports = function(username, name) {
  before(function (done) {
    var query = 'INSERT INTO vcard (username, vcard) VALUES (?)';
    var vcard = "<vCard xmlns='vcard-temp'><FN>" + name + "</FN><N><GIVEN>given</GIVEN><FAMILY>family</FAMILY></N><NICKNAME>" + name + "</NICKNAME></vCard>";
    var data = [[username, vcard]];
    db.queryWithData(query, data, function(err, result) {
      done();
    });
  });

  after(function (done) {
    var query = 'DELETE FROM vcard';
    db.directQuery(query, function() {
      done();
    });
  });
};