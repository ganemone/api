module.exports = {
  app: {
    files: [{
      expand: true,
      cwd: 'public/javascripts/',
      src: ['main.js'],
      dest: 'build/javascripts/'
    }],
  }
};