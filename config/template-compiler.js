var hogan = require('hogan.js'),
    fs = require('fs');

var template_files = ['comment_list'];
var already_compiled_templates = false;

var client_side_template_object = 'Templates';
var template_data = client_side_template_object + '={};';

module.exports = function(root_path) {

  // taken (and slightly improved) from: http://soenkerohde.com/2012/02/node-js-server-side-compile-hogan-js-templates
  // we are returning a javascript file that stores the compiled templates in a simple object named 'Templates'
  // the key for each template is the name of the file containing it , without the file suffix

  // If we have a template with the name my_template.hmtl, then the usage on the client side will be:
  //    var template = new Hogan.Template(Templates.my_template);
  //    var html_string = template.render({ foo: 1, bar: 'some text' });
  return function(req, res) {

    var send_compiled_templates = function(template_data) {
      res.contentType('text/javascript');
      res.send(template_data);
    };

    if (already_compiled_templates) {
      send_compiled_templates(template_data);
    }
    else {
      // this should only happen once, then we should simply use tempalate_data (cached in memory)
      console.log('==== compiling templates');

      var compileTemplate = function(template, callback) {
        var filename =  root_path + '/app/views/templates/' + template + '.html';
        fs.readFile(filename, function(err, contents) {
          if (err)
            throw (err);
          else {
            var temp = hogan.compile(contents.toString(), { asString : true });
            callback('\n' + client_side_template_object + '.' + template + '=' + temp);
          }
        });
      };

      var compiled_count = 0;
      for(var i=0; i < template_files.length; i++) {
        compileTemplate(template_files[i], function(templateJS) {
          template_data += templateJS;

          // when all templates have been compiled, send the genertated JS file back
          compiled_count += 1;

          if (compiled_count >= template_files.length) {
            already_compiled_templates = true;
            send_compiled_templates(template_data);
          }
        });
      }
    }
  };
};
