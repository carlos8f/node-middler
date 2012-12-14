var currentId = 0
  , parseUrl = require('../').parseUrl
  , pathRegExp = require('../').pathRegExp
  , Middler

function Item (args) {
  this.weight = 0;

  this.paths = [];
  this.methods = [];
  this.fns = [];

  var self = this;

  Array.prototype.slice.call(args).forEach(function (arg) {
    if (typeof arg === 'object') {
      // Item properties
      arg = Object.keys(arg).map(function (k) {
        return arg[k];
      });
    }
    if (!Array.isArray(arg)) {
      arg = [arg];
    }
    arg.forEach(function (arg) {
      if (arg instanceof RegExp || (typeof arg === 'string' && arg[0] === '/')) {
        // Implied path string/regex
        self.paths.push(arg);
      }
      else if (typeof arg === 'number') {
        // Implied weight
        self.weight = arg;
      }
      else if (typeof arg === 'string') {
        // Implied HTTP method
        self.methods.push(arg);
      }
      else if (typeof arg === 'function') {
        // middleware handler
        self.fns.push(arg);
      }
    });
  });

  if (!this.fns.length) {
    throw new Error('middler expected a middleware callback of some kind');
  }

  this.methods = this.methods.map(function (method) {
    return method.toUpperCase();
  });

  if (this.paths.length) {
    this.paramses = [];
    this.regexes = this.paths.map(function (p) {
      var params = [];
      self.paramses.push(params);
      return pathRegExp(p, params, true, true);
    });
  }

  this.id = currentId++;

  if (this.fns.length === 1) {
    this.fn = this.fns[0];
  }
  else {
    // Embed a middler instance to handle the chaining!
    if (typeof Middler === 'undefined') {
      Middler = require('../').Middler;
    }
    this.chain = new Middler();
    this.fns.forEach(function (fn) {
      self.chain.add(fn);
    });
    this.fn = this.chain.handler;
  }

  // performance
  this.methodCount = this.methods.length;
  this.pathCount = this.paths.length;
}
module.exports = Item;

function inArray (val, arr, length) {
  if (!arr || !length) return false;
  for (var idx = 0; idx < length; idx++) {
    if (arr[idx] === val) return true;
  }
  return false;
}

Item.prototype.match = function(req) {
  if (this.methodCount && req.method !== 'HEAD' && !inArray(req.method, this.methods, this.methodCount)) {
    return false;
  }
  if (!this.pathCount) {
    return true;
  }

  var reqPath = parseUrl(req).pathname;

  // Exact match
  if (inArray(reqPath, this.paths, this.pathCount)) return {};

  var self = this;

  for (var idx = 0; idx < this.pathCount; idx++) {
    // Try the regex
    var matches = this.regexes[idx].exec(reqPath);

    if (!matches) continue;
    matches.shift();

    var params = [];
    matches.forEach(function (val, idx2) {
      var key = self.paramses[idx][idx2];
      if (key) {
        params[key.name] = val;
      }
      else {
        params.push(val);
      }
    });
    return params;
  }

  return false;
};