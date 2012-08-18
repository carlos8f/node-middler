middler
=======

A trivial middleware runner

Idea
----

middler is a lightweight middleware runner for Node.js, providing
[express](https://github.com/visionmedia/express)-like routing and
[union](https://github.com/flatiron/union) compatibility. Best of all, the code
is dead simple and dependency-free.

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