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
  function(req, res, next) {
    // ... do some stuff
  },
  buffet,
  buffet.notFound
]);
```

License
-------

MIT