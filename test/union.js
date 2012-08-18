describe('union compatibility', function () {
  var baseUrl, server;
  before(function (done) {
    listen(function (s, port) {
      server = s;
      baseUrl = 'http://localhost:' + port;
      middler(server)
        .add(function () {
          this.res.test = true;
          this.res.emit('next');
        })
        .add(function () {
          assert.equal(this.res.test, true);
          writeRes(this.res, 'all cool');
        });
      done();
    });
  });

  it('get /', function (done) {
    request.get(baseUrl + '/', function (res) {
      assertRes(res, 'all cool');
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});