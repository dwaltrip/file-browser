// get Item model
var Item = require('../models/item');

var merge = require('object-merge');

// lambdas for Hogan templates (they work a little differently for hogan-express vs. standard Mustache)
// should move this into a helper file at some point
var lambdas = {
  capitalize: function(word) {
    console.log('-- lambdas.capitalize:', word);
    word = word.trim();
    var capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    return capitalized;
  }
};

var render = function(res, template, params) {
  params = params || {};
  params.lambdas = lambdas;
  res.render(template, params);
};

var item_parent_path = function(item) {
  var item = item || {};
  // sort of weird how you have to compare projectId.id to parentId.id
  if (item.hasParent && item.projectId.id == item.parentId.id)
    return '/projects/' + item.parentId;
  else
    return (item.hasParent) ? ('/items/' + item.parentId) : '/projects';
};

// ----------------
// Items Controller
// ----------------
exports.controller = {

  index: function(req, res) {
    Item.find({ parentId: null }, null, { sort: { created_at: 1 } }, function(err, projects) {
      render(res, 'items/index', { projects: projects });
    });
  },

  show: function(req, res) {
    Item.findById(req.params.id, function(err, item) {
      item.findProjectRoot(function(err, project) {
        item.childrenSorted(function(childItems) {
          render(res, 'items/show', {
            project_name: project.name,
            item: item,
            childItems: childItems,
            hasChildren: (childItems.length > 0),
            back_link: item_parent_path(item)
          });
        });
      });
    });
  },

  new: function(req, res) {
    var params = {
      action:       '/items',
      parentId:     req.query.parentId || null,
      kind:         req.query.kind == 'file' ? Item.FILE : Item.FOLDER,
      kind_string:  req.query.kind == 'file' ? 'file' : 'folder',
      back_link:    req.query.parentId ? ('/items/' + req.query.parentId) : '/projects'
    }

    render(res, 'items/new', params);
  },

  create: function(req, res) {
    var kind = (parseInt(req.body.kind, 10) == Item.FILE) ? Item.FILE : Item.FOLDER;
    var new_item = new Item({ name: req.body.name, kind: kind });

    var save_and_redirect = function() {
      new_item.save(function (err, saved_item) {
        if (err) return console.error(err);
        res.redirect(item_parent_path(saved_item));
      });
    };

    if (req.body.parentId) {
      Item.findById(req.body.parentId, function(err, parentItem) {
        new_item.parentId = parentItem._id;
        new_item.projectId = parentItem.projectId || parentItem._id;
        save_and_redirect();
      });
    }
    else {
      save_and_redirect();
    }
  },

  // convencience action for development, deletes all records from Item collection
  clear_collection: function(req, res) {
    Item.remove({}, function(err) {
      Item.count({}, function(err, count) {
        res.send("<p>Development tool -- all Item records just deleted.</p><p>Item Count: " + count + "</p>" + '<a href="/projects">Projects Index</a>');
      });
    });
  }

};
