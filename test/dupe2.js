describe('dupe2', function () {
  var server, port;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      port = p;
      done();
    });
  });

  var ran = [];
  function mw1 (req, res, next) {
    assert.deepEqual(req.params, {});
    res.ran.push('mw1');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(res.ran));
    res.end();
  };
  function mw2 (req, res, next) {
    assert.deepEqual(req.params, {id: '123'});
    res.ran.push('mw2');
    next();
  };
  function mw3 (req, res, next) {
    assert.deepEqual(req.params, {id: '123'});
    res.ran.push('mw3');
    next();
  };

  it('server', function (done) {
    middler(server)
      .add(function (req, res, next) {
        res.ran = [];
        next();
      })
      .post('/user/reset-password', [mw1])
      .post('/user/:id', mw2, mw3)
      .add(function (req, res) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(res.ran));
        res.end();
      })
    done();
  });
  it('user/reset-password', function (done) {
    request.post('http://localhost:' + port + '/user/reset-password', function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, ['mw1']);
      done();
    });
  });
  it('user/:id', function (done) {
    request.post('http://localhost:' + port + '/user/123', function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, ['mw2', 'mw3']);
      done();
    });
  });
});