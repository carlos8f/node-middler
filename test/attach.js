describe('attach', function () {
  var server, port;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      port = p;
      done();
    });
  })
  it('can attach existing middler instance', function (done) {
    var instance = middler()
      .add(function (req, res, next) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('hello world');
      })
      .attach(server);

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