#!/usr/bin/env node

var spawn = require('child_process').spawn
  , test = process.argv[2]
  , fs = require('fs')
  , idgen = require('idgen')

var testServer = spawn('node', [require('path').resolve(__dirname, './' + test)]);
testServer.stdout.once('data', function (chunk) {
  var port = parseInt(chunk, 10)
    , baseUrl = 'http://localhost:' + port
    , args = ['-b', '-t', '30s']

  if (test.indexOf('routes') !== -1) {
    var urls = []
      , urlFilePath = '/tmp/middler-benchmark-' + idgen() + '.txt'

    for (var i = 1; i <= 100; i++) {
      urls.push(baseUrl + '/test/' + i);
    }
    // Repeat all the urls, in case there is caching.
    urls = urls.concat(urls);

    fs.writeFileSync(urlFilePath, urls.join('\n'));
    args = args.concat(['-f', urlFilePath]);
  }
  else {
    args.push(baseUrl + '/');
  }
  var siege = spawn('siege', args)
    , output = ''

  siege.stderr.on('data', function (chunk) {
    output += chunk;
  });

  siege.on('close', function () {
    console.log(output);
    // console.log(output.match(/([\d\.]+ trans\/sec)/)[1]);
    if (typeof urlFilePath !== 'undefined') {
      fs.unlinkSync(urlFilePath);
    }
    testServer.kill();
  });
});
