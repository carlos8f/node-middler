middler
=======

An embeddable middleware runner

[![Build Status](https://secure.travis-ci.org/carlos8f/node-middler.png?branch=master)](http://travis-ci.org/carlos8f/node-middler)

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

server.listen(3000);
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

Benchmarks
----------

My results: https://gist.github.com/3473117

### App with single middleware, "hello world"

```
****************  middler (7646.63 rps)
****************  connect (7198.48 rps)
*******           union (3057.69 rps)
```

### App with 100 routes

```
****************  middler-routes (6870.59 rps)
***************   express-routes (6335.41 rps)
******            director-routes (2414.89 rps)
```

### Running your own benchmark

In the middler root, run:

```bash
$ make bench
```

Brought to you by [benchmarx](https://github.com/carlos8f/node-benchmarx).

License
-------

Developed by [Terra Eclipse](http://www.terraeclipse.com)
--------------------------------------------------------
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

[http://www.terraeclipse.com](http://www.terraeclipse.com)


License: MIT
------------
Copyright (C) 2012 Terra Eclipse, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
