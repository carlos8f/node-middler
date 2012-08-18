middler
=======

A trivial middleware runner

Idea
----

middler is a lightweight middleware runner for Node.js, packing
[express](https://github.com/visionmedia/express)-like routing and full
[connect](https://github.com/senchalabs/connect)/
[union](https://github.com/flatiron/union) compatibility. Best of all, the code
is dead simple and dependency-free. Enjoy!

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