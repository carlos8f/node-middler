var middler = require('../')
  , assert = require('assert')

describe('basic test', function () {
  it('serves basic middleware', function (done) {
    listen(function (server, port) {
      server.once('close', done);
      middler(server)
        .add(function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
          res.end('hello world');
        });

      request.get('http://localhost:' + port + '/', function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
        assert.equal(res.text, 'hello world');
        server.close();
      });
    });
  });
});