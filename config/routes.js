var Item = require('../app/models/item').Item;

module.exports = function(app){

	//home route
	var main = require('../app/controllers/main');
  console.log('----', typeof(main), '--', typeof(main.homepage));
	app.get('/', main.homepage);

  app.get('/test', function(req, res) {
    var item_string = '';
      var new_item1 = new Item({ name: 'test-item-1', kind: 1 });

      new_item1.save(function (err, saved_item1) {
        if (err) return console.error(err);

        console.log('======= new item:', saved_item1.name);
        item_string += saved_item1.name;

        var new_item2 = new Item({ name: 'test-item-2', kind: 1 });

        new_item2.save(function (err, saved_item2) {
          if (err) return console.error(err);

          console.log('======= new item:', saved_item2.name);
          item_string += ', ' + saved_item2.name;
          res.send("Hi, this is a test page, generated without a template using 'res.send(...)'. Item string: " + item_string);
        });
      });
  });

  // final handler, return 404
  app.use(function(req, res, next) {
    console.log('---- returning 404 page');
    res.status(404).render('404', { title: '404' });
  });

};
