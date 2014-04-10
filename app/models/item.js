var mongoose = require('mongoose');

var FILE = 1,
    FOLDER = 0;

var itemSchema = mongoose.Schema({
    name: String,
    kind: { type: Number, enum: [FILE, FOLDER] },
    parentId: mongoose.Schema.Types.ObjectId
});
var Item = mongoose.model('Item', itemSchema);

exports.Item = Item;


