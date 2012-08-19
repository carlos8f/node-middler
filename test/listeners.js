describe('existing listeners', function () {
  var server, baseUrl;
  before(function (done) {
    listen(function (s, p) {
      server = s;
      baseUrl = 'http://localhost:' + p;
      server.on('request', function (req, res) {
        writeRes(res, 'hi from existing listener');
      });

      middler(server)
        .get('/', function (req, res, next) {
          writeRes(res, 'hi from middler');
        });
      done();
    });
  });

  it('gets middler path', function (done) {
    request.get(baseUrl + '/', function (res) {
      assertRes(res, 'hi from middler');
      done();
    });
  });

  it('falls back to listener', function (done) {
    request.get(baseUrl + '/stuff', function (res) {
      assertRes(res, 'hi from existing listener');
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});