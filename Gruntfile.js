module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  // Load up all the grunt config files in /grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      react: {
        files: 'react/**/*.jsx',
        tasks: ['browserify']
      }
    },
    browserify: {
      options: {
        transform: [ require('grunt-react').browserify ]
      },
      client: {
        src: ['react/**/*.jsx'],
        dest: 'public/scripts/react/bundle.js'
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
  grunt.registerTask('default', [
    'browserify'
  ]);
};
