module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  // Load up all the grunt config files in /grunt
  grunt.initConfig({
    browserify: {
      app: {
        files: [{
          expand: true,
          cwd: 'public/javascripts/',
          src: ['main.js'],
          dest: 'build/javascripts/'
        }],
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public/stylesheets',
          dest: 'build/stylesheets',
          src: [
            'main.scss'
          ],
          ext: '.css'
        }]
      }
    },
    watch: {
      css: {
        files: [
          'public/stylesheets/**/*.scss',
          'public/javascripts/**/*.js'
        ],
        tasks: ['sass', 'browserify'],
        options: {
          livereload: true,
          spawn: false,
          interrupt: true,
        }
      }
    }
  });
};
