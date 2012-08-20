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

for (var i = 1; i <= 100; i++) {
  router.get('/test/' + i, function () {
    this.res.end('test #' + i);
  });
}

server.listen(0);
console.log(server.address().port);