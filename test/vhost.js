describe('vhost matching', function () {
  var baseUrl, baseUrl2, server;
  before(function (done) {
    listen(function (s, port) {
      server = s;
      baseUrl = 'http://localhost:' + port;
      baseUrl2 = 'http://127.0.0.1:' + port;
      middler(server)
        .add('*', function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
          res.write('hi, ');
          next();
        })
        .add('*lhost', function (req, res, next) {
          res.end('i am localhost');
        })
        .add('127.0.0.1', function (req, res, next) {
          res.end('i am ipv4');
        });
      done();
    });
  });

  it('get localhost', function (done) {
    request.get(baseUrl + '/', function (err, res) {
      assertRes(res, 'hi, i am localhost');
      done();
    });
  });

  it('get ipv4', function (done) {
    request.get(baseUrl2 + '/', function (err, res) {
      assertRes(res, 'hi, i am ipv4');
      done();
    });
  });

  it('close', function (done) {
    server.once('close', done);
    server.close();
  });
});