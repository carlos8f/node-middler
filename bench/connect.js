var connect = require('connect')
  , http = require('http')

var app = connect();

app.use(function (req, res, next) {
  res.end('hello world');
});

var server = http.createServer(app);

server.listen(0);
console.log(server.address().port);