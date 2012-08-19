middler
=======

An embeddable middleware runner

Idea
----

middler is a flexible, tiny middleware runner for Node.js which can easily be
embedded in an existing http server or even an existing middleware chain.
Also provided is [express](https://github.com/visionmedia/express)-like routing
and [union](https://github.com/flatiron/union) compatibility. Best of all, the
code is dead simple and dependency-free.

Enjoy!

Install
-------

```
$ npm install middler
```

Basic usage
-----------

```javascript
var middler = require('middler')
  , server = require('http').createServer()
  , buffet = require('buffet')('./public')

middler(server)
  .add(buffet)
  .add(function(req, res, next) {
    // ... do some stuff
    next();
  })
  .add(buffet.notFound);
```

Routing
-------

```javascript
middler(server)
  .get('/robots.txt', function (req, res, next) {
    res.end('humans only!');
  })
  .post('/posts/:id', function (req, res, next) {
    // req.params.id available
  });
```

Multiple paths/methods/handlers
-------------------------------

```javascript
middler(server)
  .add(['get', 'post'], '/', function (req, res, next) {
    // handle both get and post requests
  });

// Or add multiple handlers
function bodyParser (req, res, next) { req.body = ... }
function formHandler (req, res, next) { use req.body ... }

middler(server)
  .post('/posts', [bodyParser, formHandler]);
```

middler is a middleware, too
----------------------------

Writing some middleware and need routes? Just use `middler().handler` which
returns a middleware handler!

```javascript
var connect = require('connect')
  , http = require('http')
  , middler = require('middler')

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use(connect.directory('public'))
  .use(connect.cookieParser('my secret here'))
  .use(connect.session())
  .use(middler()
    .get('/', function (req, res, next) {
      res.end('hello world!');
    })
    .add(function (req, res) {
      res.writeHead(404);
      res.end('page not found');
    })
    .handler
  );

http.createServer(app).listen(3000);
```

[union](https://github.com/flatiron/union) compatibility
--------------------------------------------------------

```javascript
middler(server)
  .add(function () {
    // this.req
    // this.res
    this.res.emit('next');
  });
```

License
-------

MIT