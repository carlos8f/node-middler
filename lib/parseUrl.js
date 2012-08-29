var parse = require('url').parse;

// Cached parsed urls.
module.exports = function parseUrl (req) {
  var parsed = req._parsedUrl;

  if (parsed && parsed.href == req.url) {
    return parsed;
  }
  else {
    return req._parsedUrl = parse(req.url);
  }
};