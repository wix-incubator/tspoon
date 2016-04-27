'use strict';

var path = require('path');
var assert = require('power-assert');
var isHTML = require('is-html');
var GitHubMarkdown = require('../dist/');

it('should out html', function (callback) {

  this.timeout(5000);

  var file = path.join(__dirname, '../readme.md');
  var ghmd = new GitHubMarkdown({
    title: path.basename(file, '.md'),
    file: file
  });

  ghmd.render().then(function (html) {
    assert(isHTML(html));
    callback();
  });
});
