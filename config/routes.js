
module.exports = function(app){

  var main = require('../app/controllers/main');
  var items = require('../app/controllers/items').controller;

	// root route
	app.get('/', items.index);

  // test route
  app.get('/test', main.test);

	app.get('/projects', items.index);
	app.get('/items', items.index);

	app.post('/items', items.create);

	app.get('/projects/new', items.new);
	app.get('/items/new', items.new);


	app.get('/projects/:id', items.show);
	app.get('/items/:id', items.show);

  // final handler, return 404
  app.use(function(req, res, next) {
    console.log('---- returning 404 page');
    res.status(404).render('404', { title: '404' });
  });

};
