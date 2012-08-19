#!/usr/bin/env node

var spawn = require('child_process').spawn
  , runner = process.argv[2]

var runner = spawn('node', [require('path').resolve(__dirname, './' + runner)]);
runner.stdout.once('data', function (chunk) {
  var port = parseInt(chunk, 10);
  var siege = spawn('siege', ['-b', '-t', '10s', 'http://localhost:' + port + '/']);

  var output = '';

  siege.stderr.on('data', function (chunk) {
    output += chunk;
  });

  siege.on('close', function () {
    console.log(output.match(/([\d\.]+ trans\/sec)/)[1]);
    runner.kill();
  });
});