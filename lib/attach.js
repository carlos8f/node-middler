var Middler = require('../').Middler;

module.exports = function attach (server, fn) {
  if (!server._middler) {
    if (fn instanceof Middler) {
      server._middler = fn;
    }
    else {
      server._middler = new Middler();
    }
    server._middler.server = server;
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

  if (fn && !(fn instanceof Middler)) {
    server._middler.add(fn);
  }

  return server._middler;
};