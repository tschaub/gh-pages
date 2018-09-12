const ghpages = require('../../lib/index');
const sinon = require('sinon');
const cli = require('../../bin/gh-pages');

describe('gh-pages', function() {
  beforeEach(function() {
    sinon.stub(ghpages, 'publish');
  });

  afterEach(function() {
    ghpages.publish.restore();
  });

  const defaults = {
    repo: undefined,
    silent: false,
    branch: 'gh-pages',
    src: '**/*',
    dest: '.',
    message: 'Updates',
    dotfiles: false,
    add: false,
    remote: 'origin',
    push: true
  };

  const scenarions = [
    ['--dist lib', 'lib', defaults],
    ['--dist lib -n', 'lib', {push: false}],
    ['--dist lib -x', 'lib', {silent: true}],
    ['--dist lib --dotfiles', 'lib', {dotfiles: true}],
    ['--dist lib --dest target', 'lib', {dest: 'target'}],
    ['--dist lib -a', 'lib', {add: true}]
  ];

  scenarions.forEach(function(scenario) {
    const args = scenario[0].split(' ');
    const dist = scenario[1];
    const config = scenario[2];

    it(args.join(' '), function() {
      cli(['node', 'gh-pages'].concat(args));
      sinon.assert.calledWithMatch(ghpages.publish, dist, config);
    });
  });
});
