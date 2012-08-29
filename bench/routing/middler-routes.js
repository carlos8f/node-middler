var middler = require('../../')()
  , http = require('http')
  , server

exports.version = require(require('path').resolve(__dirname, '../../package')).version;

exports.listen = function (options, cb) {
  server = http.createServer();
  
  for (var i = 1; i <= 100; i++) {
    middler.get('/test/' + i, function (req, res, next) {
      res.end('test #' + i);
    });
  }

  middler.attach(server);

  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};