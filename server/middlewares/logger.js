module.exports = function(req, res, next) {
  console.log('-------- RECIEVED REQUEST --------');
  console.log('-------- req.path --------');
  console.log(req.path);
  return next();
};
