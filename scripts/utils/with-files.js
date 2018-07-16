var glob = require('glob');

var root = require('../../root');

module.exports = function(globPattern, cb, module) {
  if (module) {
    globPattern = module + '/' + globPattern;
  }

  return new Promise(function(resolve, reject) {
    glob(globPattern, { cwd: root, absolute: true }, function(er, files) {
      if (er) {
        throw er;
      }

      var x,
        y,
        promises = [];

      for (x = 0, y = files.length; x < y; x++) {
        promises.push(cb(files[x]));
      }

      Promise.all(promises).then(resolve, reject);
    });
  });
};
