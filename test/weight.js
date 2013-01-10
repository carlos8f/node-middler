describe('weight', function () {
  var server, port, m;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      port = p;
      m = middler(server)
        .last(function (req, res, next) {
          res.end(' three');
        })
        .first(function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('one');
          next();
        })
        .add(500, function (req, res, next) {
          res.write(' two');
          next();
        })

      done();
    });
  });

  it('correct order', function (done) {
    request.get('http://localhost:' + port + '/', function (res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.text, 'one two three');
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});