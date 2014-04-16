// get Comment model
var Comment = require('../models/comment');

var template_context_inspector = function () { return function () { console.log(this); } };

exports.controller = {

  index: function(req, res) {

    Comment.find({}, null, { sort: { created_at: 1 } }).lean().exec(function(err, comments) {
      res.format({
        html: function() {
          console.log('===== comments.index, type: HTML');
          res.render('comments/index', { partials: { comment_list: 'templates/comment_list' }, comments: comments });
        },

        json: function() {
          console.log('===== comments.index, type: JSON');
          res.json(comments);
        }
      });
    });
  },

  create: function(req, res) {
    counter += 1;
    var new_comment = new Comment({ author: ('author ' + counter), comment: ('comment ' + counter + ', blah blah!') });

    new_comment.save(function (err, saved_comment) {
      if (err) return console.error(err);
      res.formats({
        json: function() { res.json({ comment: saved_comment }); }
      });
    });
  }

};
