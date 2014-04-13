var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var app_name = 'file-browser';

var config = {
  development: {
    root: rootPath,
    app: {
      name: app_name
    },
    port: 9000,
    db: 'mongodb://localhost/' + app_name + '-development'
  },

  test: {
    root: rootPath,
    app: {
      name: app_name
    },
    port: 9000,
    db: 'mongodb://localhost/' + app_name + '-test'
  },

  production: {
    root: rootPath,
    app: {
      name: app_name
    },
    port: 9000,
    db: 'mongodb://localhost/' + app_name + '-production'
  }
};

module.exports = config[env];
