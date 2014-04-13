// get Item model
var Item = require('../models/item');

exports.controller = {

  index: function(req, res) {
    var projects = [];

    Item.find({ parentId: null }).stream().on('data', function (doc) { projects.push(doc.toObject()) })
    .on('error', function (err) { console.log('-- error:', err) })
    .on('close', function () { res.render('items/index', { projects: projects }); });
  },

  show: function(req, res) {
    Item.findById(req.params.id, function(err, item) {
      /*
      Item.find({ parentId: item._id }).stream().on('data', function (doc) { childItems.push(doc.toObject()) })
      .on('error', function (err) { console.log('-- error:', err) })
      .on('close', function () {
        res.render('items/show', { item: item, childItems: childItems, index_link: '/items' });
      });
      */

      /*
      var childItems = [];
      item.childrenStream({
        each: function(child) { childItems.push(child.toObject()) },
        lastly: function() {
          res.render('items/show', { item: item, childItems: childItems, index_link: '/items' });
        }
      });
      */

      // this logic for determining is incomplete, if the parent is a project root then it should be
      var back_link = (item.hasParent()) ? ('/items/' + item.parentId) : '/projects';
      console.log('------ hasParent: %s, parentId: %s, back_link: %s', item.hasParent(), item.parentId, back_link);

      item.children(function(err, childItems) {
        res.render('items/show', {
          item: item,
          childItems: childItems,
          hasChildren: (childItems.length > 0),
          back_link: back_link
        });
      });
    });
  },

  new: function(req, res) {
    var params = { action: '/items' };
    params.parentId = req.query.parentId || null;

    res.render('items/new', params);
  },

  create: function(req, res) {
    var kind = (req.body.kind == 'file') ? Item.FILE : Item.FOLDER;
    var new_item = new Item({ name: req.body.name, kind: kind });

    if (req.body.parentId) {
      Item.findById(req.body.parentId, function(err, parentItem) {
        console.log('-- parentItem -- name: %s, kind: %s, id: %s', parentItem.name, parentItem.kind, parentItem._id);
      });
      new_item.parentId = req.body.parentId;
    }

    new_item.save(function (err, saved_item) {
      if (err) return console.error(err);
      res.redirect('/items');
    });
  }

};
