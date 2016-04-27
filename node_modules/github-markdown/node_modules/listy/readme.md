# listy

[![Build Status](https://travis-ci.org/1000ch/listy.svg?branch=master)](https://travis-ci.org/1000ch/listy)
[![NPM version](https://badge.fury.io/js/listy.svg)](http://badge.fury.io/js/listy)
[![Dependency Status](https://david-dm.org/1000ch/listy.svg)](https://david-dm.org/1000ch/listy)
[![devDependency Status](https://david-dm.org/1000ch/listy/dev-status.svg)](https://david-dm.org/1000ch/listy#info=devDependencies)

List resolved paths from any arguments.

## Usage

```javascript
var listy = require('listy');

listy('./**/*.js').then(function (paths) {
  console.log(paths);
  // JavaScript files
});

listy(['./index.js', '../directory']).then(function (paths) {
  console.log(paths);
  // resolved path to index.js and files in directory
});

var files = listy.sync('./**/*.js');
// JavaScript files
```

## Install

With [npm](https://www.npmjs.com/) do:

```bash
$ npm install listy
```

## API

### `listy(arguments[, options])`

### `listy.sync(arguments[, options])`

`listy()` returns promise object, `listy.sync()` returns file list synchronously.

#### arguments

Type: `String` or `Array<String>`

#### options

Type: `Object` which contains following optional parameters.

- `ext` (Type: `String`)
- `filter` (Type: `Function`)

They will filter resolved file paths.

## License

MIT: http://1000ch.mit-license.org
