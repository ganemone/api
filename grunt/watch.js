module.exports = {
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
};
