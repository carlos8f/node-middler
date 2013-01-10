describe('routing', function () {
  var baseUrl, server, rootArgs = {
    method: 'get',
    path: '/',
    fn: function (req, res, next) {
      writeRes(res, 'welcome');
    }
  };
  before(function (done) {
    listen(function (s, port) {
      server = s;
      baseUrl = 'http://localhost:' + port;
      middler(server)
        .add(rootArgs)
        .post('/posts', function (req, res, next) {
          var data = '';
          req.on('data', function (chunk) {
            data += chunk;
          });
          req.once('end', function () {
            assert.deepEqual(JSON.parse(data), {post: 'my post'});
            writeRes(res, 'post created');
          });
        })
        .get('/posts', function (req, res, next) {
          writeRes(res, 'list of posts');
        })
        .get('/posts/:post', function (req, res, next) {
          writeRes(res, 'post: ' + req.params.post);
        })
        .add('/services/*/*', function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(req.params));
        })
        .add(function (req, res) {
          writeRes(res, 'not found', 404);
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
      done();
    });
  });

  it('can remove a middleware', function (done) {
    middler(server).remove(rootArgs.fn);
    request.get(baseUrl + '/', function (res) {
      assertRes(res, 'not found', 404);
      done();
    });
  });

  it('can use unnamed params', function (done) {
    request.put(baseUrl + '/services/foo/bar', function (res) {
      assert.deepEqual(res.body, ['foo', 'bar']);
      done();
    });
  });

  it('can remove a middleware by path', function (done) {
    middler(server).remove('/services/*/*');
    request.get(baseUrl + '/services/foo/bar', function (res) {
      assertRes(res, 'not found', 404);
      done();
    });
  });

  it('can add a middleware to run first', function (done) {
    middler(server).first('/posts', function (req, res, next) {
      writeRes(res, 'whoa!', 500);
    });
    request.get(baseUrl + '/posts', function (res) {
      assertRes(res, 'whoa!', 500);
      done();
    });
  });

  it('closes the server', function (done) {
    server.once('close', done);
    server.close();
  });
});