describe('add dupe', function () {
  var server, port;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      port = p;
      done();
    });
  });

  var ran = [];
  function mw1 (req, res, next) { ran.push('mw1'); next(); };
  function mw2 (req, res, next) { ran.push('mw2'); next(); };

  it('does not dupe', function (done) {
    middler(server)
      .add(['get', 'post'], '/services/*', [mw1, mw2])
      .add(function (req, res) {
        assert.deepEqual(ran, ['mw1', 'mw2']);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ok');
      })

    request.get('http://localhost:' + port + '/services/foo', function (res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.text, 'ok');
      done();
    });
  });
});