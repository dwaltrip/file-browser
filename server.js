var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config/config'),
    mongoose = require('mongoose');

var app = express();

// all environments
//app.set('port', process.env.PORT || config.PORT);
app.set('port', 582);

require('./config/express')(app, config);
require('./config/routes')(app);

// Set up db connection
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect(config.db, options)
}
connect();

// Callbacks for db connection events
mongoose.connection.on('connected', function () {
  console.log('---- Mongoose default connection open to ' + config.db);
});
mongoose.connection.on('disconnected', function () {
  console.log('---- Mongoose default connection disconnected');
});
mongoose.connection.on('error', function (err) {
  console.error('----', err);
})


// start listening for requests
http.createServer(app).listen(app.get('port'), function () {
  console.log('---- Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
