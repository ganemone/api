var assert = require('assert');

function Mock(fn) {
  this.numCalled = 0;
  this.args = [];
  this.fn = fn;
}

Mock.prototype.getFn = function() {
  var self = this;
  return function() {
    self.numCalled++;
    self.args = arguments;
    if (arguments) {
      return self.fn.apply(this, arguments);
    };
    return self.fn();
  }
};

Mock.prototype.assertNotCalled = function() {
  assert.equal(this.numCalled, 0, 'Expected call count to be 0');
};

Mock.prototype.assertCalled = function() {
  assert.equal(this.numCalled > 0, true, 'Expected call count to be greated than zero');
};

Mock.prototype.assertCalledOnce = function() {
  assert.equal(this.numCalled, 1, 'Expected call count to be 1');
};

Mock.prototype.assertCalledOnceWith = function() {
  this.assertCalledOnce();
  assert.deepEqual(arguments, this.args);
};

Mock.prototype.assertArgMatches = function(index, matchFunction) {
  this._assertArgMatchesFn(index, matchFunction, true)
};

Mock.prototype.assertArgNotMatches = function(index, matchFunction) {
  this._assertArgMatchesFn(index, matchFunction, false)
};

Mock.prototype._assertArgMatchesFn = function(index, matchFunction, expectedResult) {
  assert.equal(this.args.length > index, true);
  assert.equal(matchFunction(this.args[index]), expectedResult);
};

module.exports = Mock;



