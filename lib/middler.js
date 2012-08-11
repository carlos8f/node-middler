
function Middler(server) {
  this.server = server;
  this.middleware = [];

  this.cacheListeners();
  server.on('request', this.onRequest.bind(this));
}
module.exports = Middler;

Middler.prototype.onRequest = function(req, res) {
  var self = this
    , middleware = self.get();

  (function doNext() {
    var fn = middleware.shift();

    if (fn) {
      fn(req, res, function next(err) {
        if (err) {
          console.error(err, 'middler caught an error');
          res.writeHead(500);
          res.end();
          middleware = [];
        }
        else {
          doNext();
        }
      });
    }
    else {
      self.listeners.forEach(function(fn) {
        fn.call(self.server, req, res);
      });
    }
  })();
}
module.exports = Middler;

Middler.prototype.cacheListeners = function() {
  this.listeners = this.server.listeners('request').slice(0);
  this.server.removeAllListeners('request');
};

/**
 * Adds middleware onto the stack.
 */
Middler.prototype.add = function(fn) {
  this.middleware.push(fn);
};

/**
 * Returns a copy of middleware.
 */
Middler.prototype.get = function() {
  return this.middleware.slice(0);
};