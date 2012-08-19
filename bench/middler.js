var middler = require('../')()
  , server = require('http').createServer()

for (var i = 0; i < 100; i++) {
  middler.add(function (req, res, next) {
    next();
  });
}
middler
  .add(function (req, res, next) {
    res.end('hello world');
  })
  .attach(server);

server.listen(0);
process.stdout.write(String(server.address().port));