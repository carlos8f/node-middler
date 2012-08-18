var http = require('http');

listen = function (fn) {
  var server = http.createServer();
  server.listen(0, function () {
    fn(server, server.address().port);
  });
};

request = require('superagent');