var parseUrl = require('../').parseUrl

module.exports = function matcher (item, req) {
  if (item.method && item.method !== '*' && item.method !== req.method && req.method !== 'HEAD') {
    return false;
  }
  var params = [];

  if (item.path && item.path !== '*') {
    var reqPath = parseUrl(req.url).pathname
      , matches = item.regex.exec(reqPath)

    if (!matches) return false;
    matches.shift();

    matches.forEach(function (val, idx) {
      var key = item.params[idx];

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
  }
  return params;
};