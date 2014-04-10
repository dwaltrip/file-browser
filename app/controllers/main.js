/*
 * GET home page.
 */

console.log('---- main.js controller in action');

exports.homepage = function(req, res) {
  console.log('---- about to render homepage');
  res.render('homepage', { title: 'Index' });
}
