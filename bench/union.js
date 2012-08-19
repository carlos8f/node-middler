var union = require('union')
  , before = []

for (var i = 0; i < 100; + i++) {
  before.push(function (req, res) {
    res.emit('next');
  });
}

before.push(function (req, res) {
  res.end('hello world');
});

var server = union.createServer({
  buffer: false,
  before: before
});

server.listen(0);
process.stdout.write(String(server.address().port));