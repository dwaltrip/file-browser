var mongoose = require('mongoose'),
    relativeDate = require('relative-date');

var CommentSchema = mongoose.Schema({
    author: { type: String, default: '' },
    comment: { type: String, default: '' },
    created_at: { type: Date }
});

var Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
