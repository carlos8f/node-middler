var currentId = 0
  , parseUrl = require('./parseUrl')
  , pathRegExp = require('../').pathRegExp

function Item (args, cache) {
  this.weight = 0;
  this.cache = cache;
  
  var self = this;

  Array.prototype.slice.call(args).forEach(function (arg) {
    if (typeof arg === 'object') {
      // Item properties
      Object.keys(arg).forEach(function (k) {
        self[k] = arg[k];
      });
    }
    else if (arg instanceof RegExp || (typeof arg === 'string' && arg[0] === '/')) {
      // Implied path string/regex
      self.path = arg;
    }
    else if (typeof arg === 'number') {
      // Implied weight
      self.weight = arg;
    }
    else if (typeof arg === 'string') {
      // Implied HTTP method
      self.method = arg;
    }
    else if (typeof arg === 'function') {
      // middleware handler
      self.fn = arg;
    }
  });

  if (!this.fn) {
    throw new Error('middler expected a middleware callback of some kind');
  }

  if (this.method) {
    this.method = this.method.toUpperCase();
  }
  if (this.path) {
    this.params = [];
    this.regex = pathRegExp(this.path, this.params, true, true);
  }

  this.id = currentId++;
}
module.exports = Item;

Item.prototype.match = function(req) {
  if (this.method && this.method !== req.method && req.method !== 'HEAD') {
    return false;
  }
  if (!this.path) {
    return true;
  }

  var reqPath = parseUrl(req).pathname;

  // Exact match
  if (reqPath === this.path) return {};

  // Try the regex
  var matches = this.regex.exec(reqPath)

  if (!matches) return false;
  matches.shift();

  var self = this
    , params = []

  matches.forEach(function (val, idx) {
    var key = self.params[idx];

    if (key) {
      params[key.name] = val;
    }
    else {
      params.push(val);
    }
  });
  return params;
};