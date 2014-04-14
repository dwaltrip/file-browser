var mongoose = require('mongoose'),
    relativeDate = require('relative-date');

var FOLDER = 0,
    FILE = 1;

var ItemSchema = mongoose.Schema({
    name: String,
    kind: { type: Number, enum: [FOLDER, FILE] },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, default: null },
    created_at: { type: Date },
    updated_at: { type: Date }
});

// model constants
ItemSchema.statics.FILE = FILE;
ItemSchema.statics.FOLDER = FOLDER;

// allows us to access the constants on the instances
ItemSchema.virtual('FILE').get(function() { return FILE; });
ItemSchema.virtual('FOLDER').get(function() { return FOLDER; });

// virtual properties
ItemSchema.virtual('isFile').get(function() { return (this.kind == FILE); });
ItemSchema.virtual('isFolder').get(function() { return (this.kind == FOLDER); });
ItemSchema.virtual('hasParent').get(function() { return (this.parentId != null); });
ItemSchema.virtual('created_at_relative').get(function() { return relativeDate(this.created_at); });
ItemSchema.virtual('updated_at_relative').get(function() { return relativeDate(this.updated_at); });
ItemSchema.virtual('kind_string').get(function() { return (this.kind == this.FILE) ? 'file' : 'folder'; });

// instance methods for Item model
ItemSchema.methods.children = function(opts, cb) {
  if (typeof(opts) == 'function') {
    cb = opts;
    opts = {};
  }
  return this.model('Item').find({ parentId: this._id }, null, opts, cb);
}

ItemSchema.methods.childrenSorted = function(cb) {
  return this.children({ sort: { name: 1 } }, function(err, childItems) {
    if (err) console.log('-- Item#childrenSorted -- error:', err);

    var folders = [];
    var files = [];
    for(var i=0; i < childItems.length; i++) {
      if (childItems[i].isFile)
        files.push(childItems[i]);
      else
        folders.push(childItems[i]);
    }
    var sorted = folders.concat(files);

    cb(sorted);
  });
}

ItemSchema.methods.findParent = function(cb) {
  if (!this.hasParent)
    return cb(null, this);

  return this.model('Item').findById(this.parentID, cb);
};

ItemSchema.methods.findProjectRoot = function(cb) {
  if (!this.hasParent)
    return cb(null, this);

  return this.model('Item').findById(this.projectId, cb);
};

// recursively query and iterate through all children for current item.
// pretty cool, works without promises. but promises would probably make it cleaner & more readable
ItemSchema.methods.findAllChildren = function(callbackForAllChildren) {
  var all_children_ids = [],
      all_children_names = [];

  var pop_next_and_iterate = function(remaining_items) {
    if (remaining_items.length > 0) {
      var item = remaining_items.shift();
      all_children_ids.push(item._id);
      all_children_names.push(item.name);

      item.children(function(err, childItems) {
        if (err) console.log(err);

        if (childItems.length > 0) {
          for(var i=0; i<childItems.length; i++) { remaining_items.push(childItems[i]); }
        }

        pop_next_and_iterate(remaining_items);
      });
    }
    else {
      callbackForAllChildren(all_children_ids, all_children_names);
    }
  };

  this.children(function(err, childItems) {
    if(err) console.log(err);

    var remaining_items = [];
    if (childItems.length > 0) {
      for(var i=0; i<childItems.length; i++) { remaining_items.push(childItems[i]); }
      pop_next_and_iterate(remaining_items);
    }
    else {
      callbackForAllChildren([], []);
    }
  });
}

ItemSchema.methods.kindToString = function() { return (this.kind == FOLDER) ? 'folder' : 'file' };

// pre-save hook to update the 'updated_at' time
// unforunately some of the useful model methods dont call the hooks (ex: findByIdAndUpdate)
ItemSchema.pre('save', function(next){
  this.updated_at = new Date;
  if ( !this.created_at ) {
    this.created_at = new Date;
  }
  next();
});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
