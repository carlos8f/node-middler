http = require('http');

middler = require('../')

assert = require('assert');

listen = function (fn) {
  var server = http.createServer();
  server.listen(0, function () {
    fn(server, server.address().port);
  });
};

request = require('superagent');

writeRes = function (res, body, status) {
  res.writeHead(status || 200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end(body);
};

assertRes = function (res, body, status) {
  assert.equal(res.statusCode, status || 200);
  assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
  assert.equal(res.text, body);
};