// get Item model
var Item = require('../models/item');

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

var render = function(res, template, template_vars) {
  var template_vars = template_vars || {};
  template_vars.lambdas = lambdas;
  res.render(template, template_vars);
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
      res.format({
        html: function() {
          render(res, 'items/index', { projects: projects });
        },
        json: function() {
          var _projects = [];
          for(var i=0; i<projects.length; i++) {
            var project = projects[i].toObject();
            project.updated_at_relative = projects[i].updated_at_relative;
            _projects.push(project);
          }

          res.json({ projects: _projects, isRootList: true });
        }
      });
    });
  },

  show: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

    var respond = function(data) {
      res.format({
        html: function() { render(res, 'items/show', data); },
        json: function() { res.json(data); }
      });
    };

    var addFields = function(items) {
      var items_with_fields = [];
      for(var i=0; i<items.length; i++) {
        var item = items[i].toObject();
        item.updated_at_relative = items[i].updated_at_relative;
        item.isFolder = items[i].isFolder;
        items_with_fields.push(item);
      }
      return items_with_fields;
    };

    if (req.params.id) {
      Item.findById(req.params.id, function(err, item) {
        item.findProjectRoot(function(err, project) {
          item.childrenSorted(function(childItems) {
            respond({
              project_name: project.name,
              item: item,
              childItems: addFields(childItems),
              hasChildren: (childItems.length > 0),
              back_link: item_parent_path(item)
            });
          });
        });
      });
    }
    else {
      Item.find({ parentId: null }, null, { sort: { created_at: 1 } }, function(err, projects) {
        respond({ isRoot: true, childItems: addFields(projects), hasChildren: true, project_name: 'Projects' });
      });
    }
  },

  new: function(req, res) {
    var template_vars = {
      action_title: 'Create New',
      parentId:     req.query.parentId || null,
      kind:         req.query.kind == 'file' ? Item.FILE : Item.FOLDER,
      kind_string:  req.query.kind == 'file' ? 'File' : 'Folder',
      back_link:    req.query.parentId ? ('/items/' + req.query.parentId) : '/projects',
      form_action:  '/items'
    }

    render(res, 'items/new', template_vars);
  },

  edit: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

    Item.findById(req.params.id, function(err, item) {
      var template_vars = {
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

      render(res, 'items/new', template_vars);
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

  destroy: function(req, res) {
    console.log('-- req.params: %s', JSON.stringify(req.params)); // would like to abstract this out

    Item.findById(req.params.id, function(err, item) {
      var idsToDestroy = [item._id];

      item.findAllChildren(function(childrenIds, childrenNames) {
        console.log('-- items.destroy -- item.name: %s, childrenNames: %s', item.name, JSON.stringify(childrenNames));
        idsToDestroy.concat(childrenIds);

        Item.remove({ '_id': { $in: idsToDestroy } }, function(err, removedItems) {
          if (err) console.log('---- items controller destroy, error:', err);
          res.redirect(item_parent_path(item));
        });
      });
    });
  },

  // convenience action for development, deletes all records from Item collection
  clear_collection: function(req, res) {
    Item.remove({}, function(err) {
      Item.count({}, function(err, count) {
        res.send("<p>Development tool -- all Item records just deleted.</p><p>Item Count: " + count + "</p>" + '<a href="/projects">Projects Index</a>');
      });
    });
  }

};
