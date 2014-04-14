// get Item model
var Item = require('../models/item');

exports.index = function(req, res) {
  console.log('---- about to render homepage');
  res.render('homepage', { greeting: 'Hello there' });
};

