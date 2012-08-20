#!/usr/bin/env node

var spawn = require('child_process').spawn
  , runner = process.argv[2]
  , testPath = process.argv[3] || '/'

var runner = spawn('node', [require('path').resolve(__dirname, './' + runner)]);
runner.stdout.once('data', function (chunk) {
  var port = parseInt(chunk, 10);
  var siege = spawn('siege', ['-b', '-t', '30s', 'http://localhost:' + port + testPath]);

  var output = '';

  siege.stdout.on('data', function (chunk) {
    output += chunk;
  });
  siege.stderr.on('data', function (chunk) {
    output += chunk;
  });

  siege.on('close', function () {
    console.log(output.match(/([\d\.]+ trans\/sec)/)[1]);
    runner.kill();
  });
});
