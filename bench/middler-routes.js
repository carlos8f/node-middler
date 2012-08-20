var middler = require('../')()
  , server = require('http').createServer()

middler
  .get('/test/:id', function (req, res, next) {
    res.end('hello world ' + req.params.id);
  })
  .attach(server);

server.listen(0);
console.log(server.address().port);