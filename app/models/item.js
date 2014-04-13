var mongoose = require('mongoose');

var FOLDER = 0;
var FILE = 1;

var ItemSchema = mongoose.Schema({
    name: String,
    kind: { type: Number, enum: [FOLDER, FILE] },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    created_at: { type: Date },
    updated_at: { type: Date }
});

// model constants
ItemSchema.statics.FILE = FILE;
ItemSchema.statics.FOLDER = FOLDER;

ItemSchema.methods.children = function(cb) {
  return this.model('Item').find({ parentId: this._id }, cb);
}

ItemSchema.methods.childrenStream = function(event_callbacks) {
  var that = this;
  return this.model('Item').find({ parentId: this._id }).stream()
      .on('data', event_callbacks.each)
      .on('errror', function(err) { console.log('---- Item.childrenStream error: %s (id: %s)', err, that._id) })
      .on('close', event_callbacks.lastly);
}

ItemSchema.methods.hasParent = function() {
  return (this.parentId != null);
}

// pre-save hook to update the 'updated_at' time
ItemSchema.pre('save', function(next){
  this.updated_at = new Date;
  if ( !this.created_at ) {
    this.created_at = new Date;
  }
  next();
});
var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
