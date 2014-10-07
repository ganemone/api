module.exports = function (jid) {
  return jid.substring(0, jid.indexOf('@'));
}