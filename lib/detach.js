var Middler = require('../').Middler;

module.exports = function detach (server, middler) {
  server.listeners('request').forEach(function (fn) {
    if (fn._name === 'middlerKernel') {
      server.removeListener('request', fn);
    }
  });

  return middler;
};