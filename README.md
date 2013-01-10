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
code is readable, compact, tested, benchmarked, MIT-licensed, and dependency-free.

Enjoy!

Install
-------

```
$ npm install --save middler
```

Basic usage
-----------

```javascript
var middler = require('middler')
  , server = require('http').createServer()

// to attach a single handler to the server:
middler(server, function (req, res, next) {
  console.log(req.method, req.url);
  next();
});

// calling middler(server) again will access the same middleware chain:
middler(server)
  // note: all methods are chainable!
  .get('/', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world!');
  })
  // since this handler is added last, it will run last:
  .add(function (req, res, next) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('page not found...');
  })

server.listen(3000);
```

HTTP Routing
------------

It's easy to set up routes which will respond to certain methods and paths:

```javascript
middler(server)
  .add('/', function (req, res, next) {
    // handle any request to "/" path
  })
  .get('/robots.txt', function (req, res, next) {
    // handle GET requests only
    res.end('humans only!');
  })
  .first('/posts/*', function (req, res, next) {
    // do some setup for any path starting with '/posts/'
    next();
  })
  .post('/posts/:id', function (req, res, next) {
    // req.params.id available
  })
  .put('/articles/*/*', function (req, res, next) {
    // req.params is an array with 2 elements
  })
```

Tips:

- Paths must be either strings starting with `/`, or RexExp objects.
- Other methods available: `delete`, `head`, `patch`

middler is a middleware, too
----------------------------

Now, the coolest feature of middler which sets it apart from the rest:
embeddability.

Each middler instance has a `handler` property which allows you to use the entire
chain as a single middleware handler!

Example with [connect](https://github.com/senchalabs/connect):

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

This can be extremely useful if you want to:

- Bundle your app's features as middler chains which can be optionally attached
  to the main chain, similar to "controllers" in MVC language.
- Create a vhost architecture which hands off requests to a sub-chain.
- Write node modules which provide advanced middleware (respond to a variety
  of methods/paths/etc), and can be attached directly to a server instance or
  used with connect/express/flatiron.

Stack control
-------------

To add handlers which should run first or last in the stack:

```js
middler(server)
  .last(function (req, res, next) {
    // this should run last (weight = 1000)
  })
  .first(function (req, res, next) {
    // this should run first (weight = -1000)
  })
  .add(500, function (req, res, next) {
    // numbers become weights -- give an arbitrary weight of 500, will run in-
    // between the above handlers
  })
```

To remove handler(s) from the stack:

```js
function myHandler (req, res, next) {}

middler(server)
  .add(myHandler)
  .add('/about', function (req, res, next) {
    res.end('about us');
  })
  .add(function (req, res, next) {
    res.end('page not found');
  })

// let's remove myHandler
middler(server).remove(myHandler);

// let's remove /about
middler(server).remove('/about');

// actually let's clear the whole thing
middler(server).removeAll();
```

Multiple paths/methods/handlers
-------------------------------

```javascript
middler(server)
  .add(['get', 'post'], '/', function (req, res, next) {
    // handle both GET and POST requests to "/"
  })

// Or add multiple handlers
function bodyParser (req, res, next) { req.body = ... }
function formHandler (req, res, next) { // do something with req.body ... }

middler(server)
  .post('/posts', [bodyParser, formHandler])
```

When multiple handlers are added, they execute in series when the other
conditions match.

Handling errors
---------------

If your application encounters an error, pass an Error object to the `next`
callback. The rest of the middleware chain will not run, and what middler does
with the error is dependent on the following conditions:

- If there are `error` event listener(s) on the middler instance, they will be
  invoked with `err, req, res` and the error will not propagate further.
- If there is no `error` listener:
    - In the case of an embedded middler, the error will propagate to the parent
      chain, i.e. `next(err)`.
    - Otherwise, the default error handler will run which terminates the response
      with `500 Internal Server Error` status and no body. The error and stack
      trace will be printed to `process.stderr`.

Example custom error handler:

```js
middler(server)
  .on('error', function (err, req, res) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    console.error(err.stack || err);
    res.end('sorry, blame it on Rackspace!');
  })
  .add(function (req, res, next) {
    // next() can accept an error
    next(new Error('whoops!'));
  })
```

Alternate attach syntax
-----------------------

```js
var server = require('http').createServer();
var router = middler()
  .add(function (req, res, next) {
    // handle request...
  })
  .attach(server)

// you can also detach!
router.detach();

// router can be attached do a different server now
```

[union](https://github.com/flatiron/union) compatibility
--------------------------------------------------------

```javascript
middler(server)
  .add(function () {
    // this.req
    // this.res
    this.res.emit('next');
  })
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

---

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
