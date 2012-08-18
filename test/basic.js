describe('basic test', function () {
  var server, port;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      port = p;
      done();
    });
  })
  it('serves basic middleware', function (done) {
    middler(server, function (req, res, next) {
      res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end('hello world');
    });

    request.get('http://localhost:' + port + '/', function (res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.equal(res.text, 'hello world');
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});