var express = require('express')
  , http = require('http')
  , server

exports.listen = function (options, cb) {
  var app = express();

  app.configure(function(){
    app.use(app.router);
  });

  for (var i = 1; i <= 100; i++) {
    app.get('/test/' + i, function (req, res, next) {
      res.end('test #' + i);
    });
  }

  server = http.createServer(app);
  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};