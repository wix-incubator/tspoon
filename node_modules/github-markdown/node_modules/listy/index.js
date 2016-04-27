import fs     from 'fs';
import path   from 'path';
import glob   from 'glob';
import isGlob from 'is-glob';

const normalize = (value) => {

  if (value == null) {
    return [];
  }

  let array = Array.isArray(value) ? value : [value];

  const compaction = item => item != null;
  const stringify  = item => item.toString();

  return array.filter(compaction).map(stringify);
};

const listy = (arg, options = {}) => {

  let paths   = [];
  let strings = normalize(arg);
  const push = Array.prototype.push;

  for (let string of strings) {

    if (isGlob(string)) {
      push.apply(paths, glob.sync(string));
      continue;
    }

    if (!fs.existsSync(string)) {
      continue;
    }

    let fi = fs.statSync(string);

    if (fi.isFile()) {
      paths.push(path.resolve(string));
    } else if (fi.isDirectory()) {
      push.apply(paths, fs.readdirSync(string));
    }
  }

  if (options.ext) {
    paths = paths.filter(item => path.extname(item) === options.ext);
  }

  if (typeof options.filter === 'function') {
    paths = paths.filter(item => options.filter(item));
  }

  return paths;
};

module.exports = (arg, options) => Promise.resolve(listy(arg, options));

module.exports.sync = listy;