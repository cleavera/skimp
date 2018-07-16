var child_process = require('child_process');

var promise,
  queue = [];

function run() {
  if (!queue.length) {
    promise = null;

    return;
  }

  var next = queue.shift();

  promise = new Promise(function(resolve) {
    if (next.msg) {
      console.log(next.msg);
    }

    var cp = child_process.spawn(next.cmd, { cwd: next.cwd, shell: true, stdio: 'inherit' });

    cp.on('close', function(err) {
      if (err) {
        next.reject();
        return;
      }

      resolve();
      next.resolve();
    });
  }).then(function() {
    run();
  });
}

module.exports = function(command, cwd, msg) {
  return new Promise(function(resolve, reject) {
    queue.push({ cmd: command, cwd: cwd, msg: msg, resolve: resolve, reject: reject });

    if (!promise) {
      run();
    }
  });
};
