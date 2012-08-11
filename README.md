middler
=======

A trivial middleware runner

Usage
-----

```javascript
var middler = require('middler')
  , http = require('http')
  , buffet = require('buffet')('./public')

var server = http.createServer();
middler(server, [
  buffet,
  function(req, res, next) {
    // ... do some stuff
    next();
  },
  buffet.notFound
]);
```

License
-------

MIT