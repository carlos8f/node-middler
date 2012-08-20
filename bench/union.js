var union = require('union')
  , before = []

before.push(function (req, res) {
  res.end('hello world');
});

var server = union.createServer({
  buffer: false,
  before: before
});

server.listen(0);
console.log(server.address().port);