var union = require('union');

var server = union.createServer({
  before: [
    function (req, res) {
      res.end('hello world');
    }
  ]
});

server.listen(0);
console.log(server.address().port);
