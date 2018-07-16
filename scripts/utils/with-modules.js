var withFiles = require('./with-files');
var path = require('path');

/**
 * @description Gets all the modules in the repo and calls the callback with the folder location
 * @param cb {Function} The callback to call with the module location
 * @returns {Promise} Resolves when finished
 */
module.exports = function(cb) {
  return withFiles('modules/*/package.json', function(filename) {
    var modulePath = filename.substr(0, filename.lastIndexOf('/'));

    return Promise.resolve(cb(path.relative(path.join(__dirname, '../..'), modulePath).replace(/\\/g, '/')));
  });
};
