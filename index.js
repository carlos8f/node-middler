var bladerunner = require('bladerunner');

module.exports = function (server, handler) {
  if (server && server._bladerunner) return server._bladerunner;
  var ret = bladerunner(), listeners;
  ret.attach = function (_s) {
    if (_s) server = _s;
    listeners = server.listeners('request').slice(0);
    if (listeners.length) {
      server.removeAllListeners('request');
      ret.last(function (req, res, next) {
        listeners.forEach(function (onReq) {
          onReq(req, res);
        });
      });
    }
    server.on('request', ret.handler);
    server._bladerunner = ret;
    return ret;
  };
  ret.detach = function (_s) {
    if (_s) server = _s;
    server.removeListener('request', ret.handler);
    return ret;
  };
  if (server) ret.attach(server);
  if (handler) ret.add(handler);
  return ret;
};
