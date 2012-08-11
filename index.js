var Middler = require('./lib/middler')

module.exports = function middler(server, fn) {
  if (!server._middler) {
    server._middler = new Middler(server);
  }
  if (fn) {
    server._middler.add(fn);
  }
};