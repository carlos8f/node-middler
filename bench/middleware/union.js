var union = require('union')
  , server

exports.listen = function (options, cb) {
  server = union.createServer({
    before: [
      function (req, res) {
        res.end('hello world');
      }
    ]
  });

  server.listen(0, function () {
    cb(null, server.address().port);
  });
};

exports.close = function () {
  server.close();
};