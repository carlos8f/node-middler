var middler = require('../../')()
  , http = require('http')
  , server

exports.version = require(require('path').resolve(__dirname, '../../package')).version;

exports.listen = function (options, cb) {
  server = http.createServer();

  middler
    .add(function (req, res, next) {
      res.end('hello world');
    })
    .attach(server);

  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};