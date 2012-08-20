var union = require('union')
  , director = require('director')

var router = new director.http.Router();

var server = union.createServer({
  before: [
    function (req, res) {
      var found = router.dispatch(req, res);
      if (!found) {
        res.emit('next');
      }
    }
  ]
});

for (var i = 0; i < 100; i++) {
  router.get('/test/' + i, function () {
    this.res.write('what\'s up!\n\n');
    this.res.emit('next');
  });
}
router.get('/test/:id', function (id) {
  this.res.end('hello world ' + id);
});

server.listen(0);
console.log(server.address().port);