/**
 * @description Allows you to apply a command to multiple modules
 * @param (implicit first argument) {string} The command to apply
 * @param --changed {boolean=} Apply command to modules that have changed compared to "origin".
 * @param --modules {Array<RegExp>=} Apply command to a subset of modules
 * @param --msg {string=} Log a message before applying the command.
 * "#module#" will be replaced with the current module's name
 *
 * @example
 * - Run `npm install` on all modules: `npm run with-modules -- npm install`
 * - Run `npm install` on all modules and while logging its name: `npm run with-modules -- npm install --msg "Installing module: #module#"`
 * - Run test on changed modules to prepare for pushing: `npm run with-modules -- npm run test --changed`
 * - Log which modules have changed (note the empty command): `npm run with-modules -- "" --changed --msg #module#`
 * - Run build on translate: `npm run with-modules -- npm run build --modules translate`
 * - Install a dependency on two modules: `npm run with-modules -- "npm i -S @angular/core" --modules text forms`
 * - Run grep in modules that begin with an s: `npm run with-modules -- grep import --modules /s`
 * - Show the package.json in modules that have a name shorter than 5 characters: `npm run with-modules -- cat package.json --modules \/\w{0,5}$`
 */

var withModules = require('./utils/with-modules');
var queue = require('./utils/process-queue');

withModules((module) => {
  return queue(process.argv[process.argv.length - 1], module).catch(function() {
    process.exit(1);
  });
});
