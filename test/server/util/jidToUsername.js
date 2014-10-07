var assert = require('chai').assert;
var jidToUsername = require('../../../server/util/jidToUsername.js');

describe('jidToUsername', function () {
  it('should work', function () {
    var jid = 'username@versapp.co';
    var another = 'username@harmon.dev.versapp.co';
    assert.equal(jidToUsername(jid), 'username');
    assert.equal(jidToUsername(another), 'username');
  });
});