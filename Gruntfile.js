var loadGruntConfig = require('load-grunt-config');

module.exports = function (grunt) {
  // Load up all the grunt config files in /grunt
  loadGruntConfig(grunt, {});
  // Load all the grunt tasks
  require('load-grunt-tasks')(grunt);

  // Aliases
  grunt.registerTask('build', ['sass']);
  grunt.registerTask('server', ['nodemon:dev']);
};
