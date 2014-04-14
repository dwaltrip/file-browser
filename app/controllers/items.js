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

var item_path = function(item) {
  var item = item || {};
  if (!item.hasParent)
    return '/projects/' + item._id;
  else
    return item._id ? '/items/' + item._id : '/items';
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
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

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
      action_title: 'Create New',
      parentId:     req.query.parentId || null,
      kind:         req.query.kind == 'file' ? Item.FILE : Item.FOLDER,
      kind_string:  req.query.kind == 'file' ? 'File' : 'Folder',
      back_link:    req.query.parentId ? ('/items/' + req.query.parentId) : '/projects',
      form_action:  '/items'
    }

    render(res, 'items/new', params);
  },

  edit: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

    Item.findById(req.params.id, function(err, item) {
      var params = {
        action_title: 'Edit',
        button_text:  'Update',
        edit:         true,
        parentId:     item.parentId || null,
        kind:         item.kind,
        kind_string:  item.isFile ? 'File' : 'Folder',
        back_link:    '/items/' + item._id,
        form_action:  '/items/' + item._id,
        form_method:  'put'
      }

      render(res, 'items/new', params);
    });
  },

  create: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

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

  update: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

    var new_name = req.body.name;
    if (new_name && new_name.trim().length > 0) {
      var updated_at = new Date;
      Item.findByIdAndUpdate(req.params.id, { name: new_name, updated_at: updated_at }, function(err, item) {
        res.redirect(item_path(item));
      });
    }
    else
      res.redirect('/items/' + req.params.id);
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
