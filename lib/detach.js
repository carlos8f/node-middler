var Middler = require('../').Middler;

module.exports = function detach (server, middler) {
  if (server._middler) {
    server.listeners('request').forEach(function (fn) {
      if (fn === middler.handler) {
        server.removeListener('request', fn);
      }
    });
    delete server._middler;
  }

  return middler;
};