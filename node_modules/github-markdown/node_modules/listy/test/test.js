var assert = require('power-assert');
var listy  = require('../dist/');

describe('listy', function () {

  it('should return paths from file path', function (callback) {

    this.timeout(1000);
    var argument = 'test/test.js';
    var expected = 1;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should return paths from file paths', function (callback) {

    this.timeout(1000);
    var argument = ['test/test.js', 'test/fixtures/fixture.js'];
    var expected = 2;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should not return with argument which does not exist', function (callback) {

    this.timeout(1000);
    var argument = ['test/foo.js', 'test/fixtures/bar.js'];
    var expected = 0;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should return paths from file path and folder path', function (callback) {

    this.timeout(1000);
    var argument = ['test/test.js', 'test/fixtures/'];
    var expected = 3;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should return paths from single glob', function (callback) {

    this.timeout(1000);
    var argument = 'test/**/*.json';
    var expected = 1;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should return paths from multiple glob', function (callback) {

    this.timeout(1000);
    var argument = ['test/**/*.json', 'test/**/*.js'];
    var expected = 3;

    assert(listy.sync(argument).length === expected);
    listy(argument).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should filter paths with extension', function (callback) {

    this.timeout(1000);
    var argument = ['test/**/*.json', 'test/**/*.js'];
    var expected = 2;
    var options  = {
      ext: '.js'
    };

    assert(listy.sync(argument, options).length === expected);
    listy(argument, options).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });

  it('should filter paths with function', function (callback) {

    this.timeout(1000);
    var argument = ['test/**/*.json', 'test/**/*.js'];
    var expected = 1;
    var options  = {
      filter: function(p) {
        return p.indexOf('.json') !== -1;
      }
    };

    assert(listy.sync(argument, options).length === expected);
    listy(argument, options).then(function (paths) {
      assert(paths.length === expected);
      callback();
    });
  });
});
