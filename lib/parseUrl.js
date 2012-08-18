var parse = require('url').parse;

// Cached parsed urls.
var cache = {};

module.exports = function parseUrl (url) {
  return cache[url] || (cache[url] = parse(url));
};