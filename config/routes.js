module.exports = function(app){

  var main = require('../app/controllers/main');
  var items = require('../app/controllers/items').controller;

	// root route
	app.get('/', items.index);

	app.get('/items',     items.index);
	app.get('/projects',  items.index);

	app.post('/items', items.create);

	app.get('/items/new',     items.new);
	app.get('/projects/new',  items.new);

	app.get('/items/:id',     items.show);
	app.get('/projects/:id',  items.show);

	app.get('/items/:id/edit',    items.edit);
	app.get('/projects/:id/edit', items.edit);

  // should be PUT not POST, but methodOverride wasn't working (look into & fix later)
	app.post('/items/:id',     items.update);
	app.post('/projects/:id',  items.update);

	app.post('/items/:id/delete',     items.destroy);
	app.post('/projects/:id/delete',  items.destroy);

  // for development only, clear Items collection
  app.get('/clear', items.clear_collection);

  // final handler, return 404
  app.use(function(req, res, next) {
    console.log('---- returning 404 page');
    res.status(404).render('404', { title: '404' });
  });

};
