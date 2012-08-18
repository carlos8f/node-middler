var matcher = require('./matcher')

function Middler (server) {
  this.server = server;
  this.items = [];
  this.cacheListeners();
  server.on('request', this.onRequest.bind(this));
}
module.exports = Middler;

Middler.prototype.onRequest = function (req, res) {
  var self = this
    , items = self.copy()

  (function doNext () {
    var item = items.shift();

    if (item) {
      var m = matcher(item.method, item.path, req);

      if (m) {
        req.params = m;

        item.fn(req, res, function next (err) {
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
Middler.prototype.wrap = function() {
  var item = {};

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    if (arg instanceof RegExp || (typeof arg === 'string' && arg[0] === '/')) {
      item.path = arg;
    }
    else if (typeof arg === 'string') {
      item.method = arg;
    }
    else if (typeof arg === 'function') {
      item.fn = arg;
    }
  });
  return item;
};