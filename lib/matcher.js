var parseUrl = require('./parseUrl')
  , pathRegExp = require('./pathRegExp')

module.exports = function matcher (method, path, req) {
  var reqMethod = req.method.toLowerCase();
  if (method && method !== '*' && method.toLowerCase() !== reqMethod && reqMethod !== 'head') {
    return false;
  }
  if (path && path !== '*') {
    var reqPath = parseUrl(req.url).pathname
      , paramKeys = []
      , params = []
      , regExp = pathRegExp(path, paramKeys, true, true)
      , matches = regExp.exec(path)

    if (!matches) return false;

    matches.forEach(function (val, idx) {
      var key = paramKeys[idx];

      if (typeof val === 'string') {
        val = decodeURIComponent(val);
      }
      if (key) {
        params[key.name] = val;
      }
      else {
        params.push(val);
      }
    });

    return params;
  }
  return [];
};
