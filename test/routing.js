var middler = require('../')
  , assert = require('assert')

describe('routing', function () {
  var baseUrl, server;
  before(function (done) {
    listen(function (s, port) {
      server = s;
      baseUrl = 'http://localhost:' + port;
      middler(server)
        .add('get', '/', function (req, res, next) {
          writeOK(res, 'welcome');
        })
        .add('post', '/posts', function (req, res, next) {
          var data = '';
          req.on('data', function (chunk) {
            data += chunk;
          });
          req.on('end', function () {
            assert.deepEqual(JSON.parse(data), {post: 'my post'});
            writeOK(res, 'post created');
          });
        })
        .add('get', '/posts', function (req, res, next) {
          writeOK(res, 'list of posts');
        })
        .add('get', '/posts/:post', function (req, res, next) {
          writeOK(res, 'post: ' + req.params.post);
        });
      done();
    });
  });

  it('get /', function (done) {
    request.get(baseUrl + '/', function (res) {
      assertRes(res, 'welcome');
      done();
    });
  });

  it('post /posts', function (done) {
    request.post(baseUrl + '/posts')
      .send({post: 'my post'})
      .end(function (res) {
        assertRes(res, 'post created');
        done();
      });
  });

  it('get /posts', function (done) {
    request.get(baseUrl + '/posts', function (res) {
      assertRes(res, 'list of posts');
      done();
    });
  });

  it('get /posts/:post', function (done) {
    request.get(baseUrl + '/posts/512', function (res) {
      assertRes(res, 'post: 512');
      server.once('close', done);
      server.close();
    });
  });
});

function writeOK (res, body) {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end(body);
}

function assertRes (res, body) {
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
  assert.equal(res.text, body);
}