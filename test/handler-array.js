describe('handler array', function () {
  var baseUrl, server;

  function checkParams (req, res, next) {
    if (req.url.match(/^\/youare\//)) {
      // optional param
      req.params.howmany = '1';
    }
    assert.deepEqual(req.params, {
      what: 'teapot',
      where: 'kitchen',
      howmany: '1'
    });
    req.message = 'teapot';
    next();
  }

  function checkAnonParams (req, res, next) {
    assert.deepEqual(req.params, {
      color: 'red',
      '0': 'sport'
    });
    req.message = 'vehicle';
    next();
  }

  function hello(req, res, next) {
    req.message = 'hello';
    next();
  }

  function world(req, res, next) {
    req.message += ' world';
    next();
  }

  function message(req, res, next) {
    writeRes(res, req.message);
  }

  before(function (done) {
    listen(function (s, port) {
      server = s;
      baseUrl = 'http://localhost:' + port;
      middler(server)
        .get('/', [hello, world, message])
        .get(['/sandwich', '/apple'], [hello, world, message])
        .add(['/hello', '/world'], ['get', 'post'], [hello, world, message])
        .add(['get', 'post'], ['/youare/:where/:what/1', '/iam/:what/:where/:howmany'], [checkParams, message])
        .add(['get', 'post'], ['/boats/:color/*', '/cars/:color/*'], [checkAnonParams, message])
        .add(function (req, res) {
          writeRes(res, 'not found', 404);
        });
      done();
    });
  });

  it('get /', function (done) {
    request.get(baseUrl + '/', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('get /404', function (done) {
    request.get(baseUrl + '/404', function (res) {
      assertRes(res, 'not found', 404);
      done();
    });
  });

  it('get /sandwich', function (done) {
    request.get(baseUrl + '/sandwich', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('get /apple', function (done) {
    request.get(baseUrl + '/apple', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('get /hello', function (done) {
    request.get(baseUrl + '/hello', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('post /hello', function (done) {
    request.post(baseUrl + '/hello', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('get /world', function (done) {
    request.get(baseUrl + '/world', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('post /world', function (done) {
    request.post(baseUrl + '/world', function (res) {
      assertRes(res, 'hello world');
      done();
    });
  });

  it('put /world', function (done) {
    request.put(baseUrl + '/world', function (res) {
      assertRes(res, 'not found', 404);
      done();
    });
  });

  it('get /iam/teapot/kitchen/1', function (done) {
    request.get(baseUrl + '/iam/teapot/kitchen/1', function (res) {
      assertRes(res, 'teapot');
      done();
    });
  });

  it('post /youare/kitchen/teapot/1', function (done) {
    request.post(baseUrl + '/youare/kitchen/teapot/1', function (res) {
      assertRes(res, 'teapot');
      done();
    });
  });

  it('get /cars/red/sport', function (done) {
    request.get(baseUrl + '/cars/red/sport', function (res) {
      assertRes(res, 'vehicle');
      done();
    });
  });

  it('post /boats/red/sport', function (done) {
    request.post(baseUrl + '/boats/red/sport', function (res) {
      assertRes(res, 'vehicle');
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});
