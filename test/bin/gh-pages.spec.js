const {afterEach, beforeEach, describe, it} = require('mocha');
const sinon = require('sinon');
const cli = require('../../bin/gh-pages.js');
const ghpages = require('../../lib/index.js');
const assert = require('../helper.js').assert;
const beforeAdd = require('./fixtures/beforeAdd.js');

describe('gh-pages', () => {
  describe('main', () => {
    beforeEach(() => {
      sinon
        .stub(ghpages, 'publish')
        .callsFake((basePath, config, callback) => callback && callback());
    });

    afterEach(() => {
      ghpages.publish.restore();
    });

    const scenarios = [
      {
        args: ['--dist', 'lib'],
        dist: 'lib',
        config: ghpages.defaults,
      },
      {
        args: ['--dist', 'lib', '-n'],
        dist: 'lib',
        config: {push: false},
      },
      {
        args: ['--dist', 'lib', '-f'],
        dist: 'lib',
        config: {history: false},
      },
      {
        args: ['--dist', 'lib', '-x'],
        dist: 'lib',
        config: {silent: true},
      },
      {
        args: ['--dist', 'lib', '--dotfiles'],
        dist: 'lib',
        config: {dotfiles: true},
      },
      {
        args: ['--dist', 'lib', '--nojekyll'],
        dist: 'lib',
        config: {nojekyll: true},
      },
      {
        args: ['--dist', 'lib', '--cname', 'CNAME'],
        dist: 'lib',
        config: {cname: 'CNAME'},
      },
      {
        args: ['--dist', 'lib', '--dest', 'target'],
        dist: 'lib',
        config: {dest: 'target'},
      },
      {
        args: ['--dist', 'lib', '-a'],
        dist: 'lib',
        config: {add: true},
      },
      {
        args: ['--dist', 'lib', '--git', 'path/to/git'],
        dist: 'lib',
        config: {git: 'path/to/git'},
      },
      {
        args: ['--dist', 'lib', '--user', 'Full Name <email@example.com>'],
        dist: 'lib',
        config: {user: {name: 'Full Name', email: 'email@example.com'}},
      },
      {
        args: ['--dist', 'lib', '--user', 'email@example.com'],
        dist: 'lib',
        config: {user: {name: null, email: 'email@example.com'}},
      },
      {
        args: ['--dist', 'lib', '-u', 'Full Name <email@example.com>'],
        dist: 'lib',
        config: {user: {name: 'Full Name', email: 'email@example.com'}},
      },
      {
        args: [
          '--dist',
          'lib',
          '--before-add',
          require.resolve('./fixtures/beforeAdd'),
        ],
        dist: 'lib',
        config: {beforeAdd},
      },
      {
        args: ['--dist', 'lib', '-u', 'junk email'],
        dist: 'lib',
        error:
          'Could not parse name and email from user option "junk email" (format should be "Your Name <email@example.com>")',
      },
    ];

    scenarios.forEach(({args, dist, config, error}) => {
      let title = args.join(' ');
      if (error) {
        title += ' (user error)';
      }
      it(title, async () => {
        try {
          await cli(['node', 'gh-pages'].concat(args));
        } catch (err) {
          if (!error) {
            throw err;
          }
          assert.equal(err.message, error);
          return;
        }

        if (error) {
          throw new Error(`Expected error "${error}" but got success`);
        }

        sinon.assert.calledWithMatch(ghpages.publish, dist, config);
      });
    });
  });
});
