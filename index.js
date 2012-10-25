module.exports = exports = function middler (server, fn) {
  if (server) return exports.attach(server, fn);
  return new exports.Middler();
};

exports.parseUrl = require('./lib/parseUrl');
exports.pathRegExp = require('./lib/pathRegExp');
exports.Item = require('./lib/item');
exports.Middler = require('./lib/middler');
exports.attach = require('./lib/attach');
exports.detach = require('./lib/detach');