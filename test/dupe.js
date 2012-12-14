describe('dupe', function () {
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
  function mw3 (req, res, next) { ran.push('mw3'); next(); };
  function mw4 (req, res, next) { ran.push('mw4'); next(); };

  it('does not dupe', function (done) {
    middler(server)
      .post('/services/foo', [mw1, mw2])
      .add(['get', 'post'], '/services/*', [mw3, mw4])
      .add(function (req, res) {
        assert.deepEqual(ran, ['mw1', 'mw2', 'mw3', 'mw4']);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ok');
      })

    request.post('http://localhost:' + port + '/services/foo', function (res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.text, 'ok');
      done();
    });
  });
});