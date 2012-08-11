var Middler = require('./lib/middler')
  , isArray = require('util').isArray

module.exports = function middler(server, fn) {
  if (!server._middler) {
    server._middler = new Middler(server);
  }
  if (fn) {
    if (!isArray(fn)) {
      fn = [fn];
    }
    fn.forEach(function(f) {
      server._middler.add(f);
    });
  }
  return server._middler;
};