var connect = require('connect')
  , http = require('http')

var app = connect();

for (var i = 0; i < 100; i++) {
  app.use(function (req, res, next) {
    next();
  });
}

app.use(function (req, res, next) {
  res.end('hello world');
});

var server = http.createServer(app);

server.listen(0);
console.log(server.address().port);