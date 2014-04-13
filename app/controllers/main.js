// get Item model
var Item = require('../models/item');

exports.index = function(req, res) {
  console.log('---- about to render homepage');
  res.render('homepage', { greeting: 'Hello there' });
};

exports.test = function(req, res) {
  Item.remove({}, function(err) {
    Item.count({}, function(err, count) {
      res.send("<p>Test method, all Item records just deleted.</p><p>Item Count: " + count + "</p>");
    });
  });
};
