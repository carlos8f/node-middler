var Middler = require('../').Middler;

module.exports = function attach (server, fn) {
  if (!server._middler) {
    server._middler = new Middler();
    server._middler._listeners = server.listeners('request').slice(0);
    if (server._middler._listeners.length) {
      server.removeAllListeners('request');
      server._middler.last(function cachedListeners (req, res, next) {
        server._middler._listeners.forEach(function (onReq) {
          onReq(req, res);
        });
      });
    }
    server.on('request', server._middler.handler);
  }

  if (fn) {
    server._middler.add(fn);
  }

  return server._middler;
};