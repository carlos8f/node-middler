var union = require('union')
  , director = require('director')
  , server

exports.listen = function (options, cb) {
  var router = new director.http.Router();

  server = union.createServer({
    before: [
      function (req, res) {
        var found = router.dispatch(req, res);
        if (!found) {
          res.emit('next');
        }
      }
    ]
  });

  for (var i = 1; i <= 100; i++) {
    router.get('/test/' + i, function () {
      this.res.end('test #' + i);
    });
  }

  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};