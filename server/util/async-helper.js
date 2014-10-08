function withContext(func, context, args) {
  return function (cb) {
    args.push(cb);
    func.apply(context, args);
  };
}

function noContext(func, args) {
  return withContext(func, this, args);
}

exports.withContext = withContext;
exports.noContext = noContext;