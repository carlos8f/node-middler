describe('handler array', function () {
  var baseUrl, server;

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

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});
