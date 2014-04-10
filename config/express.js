var express = require('express');

module.exports = function(app, config) {

  var env = process.env.NODE_ENV || 'development';

  console.log('---- configuring express with env:', env);
  if (env == 'development') {

    app.use(function(req, res, next) {

      if (req.path != req.url)
        console.log('-- %s %s, %s', req.method, req.path, req.url);
      else
        console.log('-- %s %s', req.method, req.path);
      next();
    });

    app.use(express.static(config.root + '/app/public'));
    app.set('port', config.port);
    app.set('views', config.root + '/app/views');

    // use hogan for templates
    app.set('view engine', 'html');
    app.set('layout', 'layouts/layout');
    app.engine('html', require('hogan-express'));
  }
  else if (env == 'production') {
    app.enable('view cache');
  }
}
