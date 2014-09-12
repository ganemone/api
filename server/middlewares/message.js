module.exports = function(req, res, next) {
  if (req.query.message) {
    res.locals.message = req.query.message;
  }
  return next();
};
