var middler = require('../')()
  , server = require('http').createServer()

for (var i = 1; i <= 100; i++) {
  middler.get('/test/' + i, function (req, res, next) {
    res.end('test #' + i);
  });
}

middler.attach(server);

server.listen(0);
console.log(server.address().port);