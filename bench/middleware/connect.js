var connect = require('connect')
  , http = require('http')
  , server

exports.listen = function (options, cb) {
  var app = connect();

  app.use(function (req, res, next) {
    res.end('hello world');
  });

  server = http.createServer(app);
  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};