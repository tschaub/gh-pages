/* eslint-env mocha */

var ghpages = require('../../lib/index');
var stub = require('../helper').stub;
var assert = require('../helper').sinon.assert;
var cli = require('../../bin/gh-pages');

describe('gh-pages', function() {
  beforeEach(function() {
    stub(ghpages, 'publish');
  });

  afterEach(function() {
    ghpages.publish.restore();
  });

  var defaults = {
    repo: undefined,
    silent: false,
    branch: 'gh-pages',
    src: '**/*',
    message: 'Updates',
    dotfiles: false,
    add: false,
    remote: 'origin',
    push: true
  };

  var scenarions = [
    ['--dist lib', 'lib', defaults],
    ['--dist lib -n', 'lib', {push: false}],
    ['--dist lib -x', 'lib', {silent: true}],
    ['--dist lib --dotfiles', 'lib', {dotfiles: true}],
    ['--dist lib -a', 'lib', {add: true}]
  ];

  scenarions.forEach(function(scenario) {
    var args = scenario[0].split(' ');
    var dist = scenario[1];
    var config = scenario[2];

    it(args.join(' '), function() {
      cli(['node', 'gh-pages'].concat(args));
      assert.calledWithMatch(ghpages.publish, dist, config);
    });
  });
});
