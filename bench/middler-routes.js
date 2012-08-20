var middler = require('../')()
  , server = require('http').createServer()

for (var i = 0; i < 100; i++) {
  middler.get('/test/' + i, function (req, res, next) {
    res.write('what\'s up!\n\n');
    next();
  });
}
middler
  .get('/test/:id', function (req, res, next) {
    res.end('hello world ' + req.params.id);
  })
  .attach(server);

server.listen(0);
console.log(server.address().port);