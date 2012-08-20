var middler = require('../')()
  , server = require('http').createServer()

middler
  .add(function (req, res, next) {
    res.end('hello world');
  })
  .attach(server);

server.listen(0, 64000);
console.log(server.address().port);