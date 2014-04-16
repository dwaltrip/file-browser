var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

module.exports = function(app, config) {

  var env = process.env.NODE_ENV || 'development';

  console.log('---- configuring express with env:', env);
  if (env == 'development') {

    app.use(methodOverride());

    // basic request logger
    app.use(function(req, res, next) {
      if (req.path != req.url)
        console.log('-- %s %s, %s', req.method, req.path, req.url);
      else
        console.log('-- %s %s', req.method, req.path);

      next();
    });

    app.use(bodyParser());

    // logger for querystring and POST data
    app.use(function(req, res, next) {
      if((Object.keys(req.body).length > 0))
        console.log('-- with data: %s', JSON.stringify(req.body));
      if(Object.keys(req.query).length > 0)
        console.log('-- with querystring: %s', JSON.stringify(req.query));

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
};
