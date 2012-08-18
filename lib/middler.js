var matcher = require('./matcher')
  , pathRegExp = require('./pathRegExp')
  , EventEmitter = require('events').EventEmitter
  , debug = require('debug')('middler')

function Middler (server) {
  this.server = server;
  this.items = [];
  this.cacheListeners();
  server.on('request', this.onRequest.bind(this));
}
module.exports = Middler;

Middler.prototype.onRequest = function (req, res) {
  var self = this
    , items = self.copy();

  (function doNext () {
    var item = items.shift();

    if (item) {
      debug('checking item: %s', JSON.stringify(item));
      var m = matcher(item, req);

      if (m) {
        debug('%s matched!', item.path);
        req.params = m;
        var thisArg = new EventEmitter;
        thisArg.req = req;
        thisArg.res = res;
        thisArg.once('next', doNext);

        item.fn.call(thisArg, req, res, function next (err) {
          if (err) {
            console.error(err, 'middler caught an error');
            res.writeHead(500);
            res.end();
          }
          else {
            doNext();
          }
        });
      }
      else {
        doNext();
      }
    }
    else {
      self.listeners.forEach(function (fn) {
        fn.call(self.server, req, res);
      });
    }
  })();
}
module.exports = Middler;

Middler.prototype.cacheListeners = function () {
  this.listeners = this.server.listeners('request').slice(0);
  this.server.removeAllListeners('request');
};

/**
 * Adds item onto the stack.
 */
Middler.prototype.add = function () {
  this.items.push(this.wrap(arguments));
  return this;
};

/**
 * Removes item from the stack.
 */
Middler.prototype.remove = function () {
  var idx = this.items.indexOf(this.wrap(arguments));
  if (idx !== -1) {
    this.items.splice(idx, 1);
  }
  return this;
};

/**
 * Inserts item onto the bottom of the stack.
 */
Middler.prototype.first = function () {
  this.items.unshift(this.wrap(arguments));
  return this;
};

/**
 * Returns a copy of all items.
 */
Middler.prototype.copy = function () {
  return this.items.slice(0);
};

/**
 * Parses arguments and wraps them in an object.
 */
Middler.prototype.wrap = function(args) {
  var item = {};
  Array.prototype.slice.call(args).forEach(function (arg) {
    if (arg instanceof RegExp || (typeof arg === 'string' && arg[0] === '/')) {
      // Implied path string/regex
      item.path = arg;
      item.params = [];
      item.regex = pathRegExp(item.path, item.params, true, true);
    }
    else if (typeof arg === 'string') {
      // Implied HTTP method
      item.method = arg.toLowerCase();
    }
    else if (typeof arg === 'function') {
      // middleware handler
      item.fn = arg;
    }
  });
  if (!item.fn) {
    throw new Error('middler expected a middleware callback of some kind');
  }
  if (!item.method) {
    item.method = '*';
  }
  return item;
};