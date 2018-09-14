const helper = require('../helper');
const ghpages = require('../../lib/index');
const sinon = require('sinon');
const cli = require('../../bin/gh-pages');
const assert = require('../helper').assert;

describe('gh-pages', () => {
  describe('main', () => {
    beforeEach(function() {
      sinon
        .stub(ghpages, 'publish')
        .callsFake((basePath, config, callback) => callback());
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

    const scenarios = [
      {
        args: ['--dist', 'lib'],
        dist: 'lib',
        config: defaults
      },
      {
        args: ['--dist', 'lib', '-n'],
        dist: 'lib',
        config: {push: false}
      },
      {
        args: ['--dist', 'lib', '-x'],
        dist: 'lib',
        config: {silent: true}
      },
      {
        args: ['--dist', 'lib', '--dotfiles'],
        dist: 'lib',
        config: {dotfiles: true}
      },
      {
        args: ['--dist', 'lib', '--dest', 'target'],
        dist: 'lib',
        config: {dest: 'target'}
      },
      {
        args: ['--dist', 'lib', '-a', 'target'],
        dist: 'lib',
        config: {add: true}
      },
      {
        args: ['--dist', 'lib', '--user', 'Full Name <email@example.com>'],
        dist: 'lib',
        config: {user: {name: 'Full Name', email: 'email@example.com'}}
      },
      {
        args: ['--dist', 'lib', '--user', 'email@example.com'],
        dist: 'lib',
        config: {user: {name: null, email: 'email@example.com'}}
      },
      {
        args: ['--dist', 'lib', '-u', 'Full Name <email@example.com>'],
        dist: 'lib',
        config: {user: {name: 'Full Name', email: 'email@example.com'}}
      },
      {
        args: ['--dist', 'lib', '-u', 'junk email'],
        dist: 'lib',
        error: 'Could not parse "Full Name <email@example.com>" from junk email'
      }
    ];

    scenarios.forEach(({args, dist, config, error}) => {
      let title = args.join(' ');
      if (error) {
        title += ' (user error)';
      }
      it(title, done => {
        cli(['node', 'gh-pages'].concat(args))
          .then(() => {
            if (error) {
              done(new Error(`Expected error "${error}" but got success`));
              return;
            }
            sinon.assert.calledWithMatch(ghpages.publish, dist, config);
            done();
          })
          .catch(err => {
            if (!error) {
              done(err);
              return;
            }
            assert.equal(err.message, error);
            done();
          });
      });
    });
  });

  describe('getUser', () => {
    it('gets the locally configured user', done => {
      const name = 'Full Name';
      const email = 'email@example.com';

      helper.setupRepo('basic', {user: {name, email}}).then(dir => {
        cli
          .getUser(dir)
          .then(user => {
            assert.equal(user.name, name);
            assert.equal(user.email, email);
            done();
          })
          .catch(done);
      });
    });
  });
});
