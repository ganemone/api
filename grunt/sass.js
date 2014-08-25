module.exports = {
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
};
