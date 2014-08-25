var config = require('../config/index.js');

module.exports = {
  dev: {
    script: './index.js',
    options: {
      ignore: ['node_modules/**'],
      callback: function (nodemon) {
        nodemon.on('log', function (event) {
          console.log(event.colour);
        });
      },
      env: {
        port: config.get('server').port
      },
      ext: 'js,jade',
    }
  }
};
