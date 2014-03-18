var path = require('path');

var jshint = require('jshint/src/cli').run;
var glob = require('glob');
var Mocha = require('mocha');


/**
 * Run the linter.
 * @param {function(Error)} done Callback.
 */
exports.lint = function(done) {
  var args = ['lib', 'test', 'tasks.js'];
  var passed = jshint({args: args});
  process.nextTick(function() {
    done(passed ? null : new Error('JSHint failed'));
  });
};


/**
 * Run the tests.
 * @param {function(Error)} done Callback.
 */
exports.test = function(done) {
  var mocha = new Mocha();
  mocha.reporter('spec');
  mocha.ui('bdd');
  mocha.files = glob.sync('test/**/*.spec.js').map(function(file) {
    return path.resolve(file);
  });
  mocha.run(function(failures) {
    done(failures ? new Error('Mocha failures') : null);
  });
};


var tasks = process.argv.slice(2);

function run(current) {
  var task = tasks[current];
  if (task) {
    exports[task](function(err) {
      if (err) {
        process.stderr.write(err.message + '\n');
        process.exit(1);
      } else {
        ++current;
        run(current);
      }
    });
  } else {
    process.exit(0);
  }
}
run(0);
