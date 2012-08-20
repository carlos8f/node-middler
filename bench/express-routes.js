var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.use(app.router);
});

for (var i = 1; i <= 100; i++) {
  app.get('/test/' + i, function (req, res, next) {
    res.end('test #' + i);
  });
}

var server = http.createServer(app);

server.listen(0);
console.log(server.address().port);