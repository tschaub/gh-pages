const helper = require('../helper');
const ghPages = require('../../lib/');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'basic';

beforeEach(function() {
  ghPages.clean();
});

describe('basic usage', function() {
  it('pushes the contents of a directory to a gh-pages branch', function(done) {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';

    helper.setupRemote(fixtureName, branch).then(function(url) {
      const options = {
        repo: url,
        user: {
          name: 'User Name',
          email: 'user@email.com'
        }
      };
      ghPages.publish(local, options, function(err) {
        if (err) {
          return done(err);
        }
        helper
          .assertContentsMatch(expected, url, branch)
          .then(function() {
            done();
          })
          .catch(done);
      });
    });
  });

  it('can push to a different branch', function(done) {
    const local = path.join(fixtures, fixtureName, 'local');
    const branch = 'master';

    helper.setupRemote(fixtureName, branch).then(function(url) {
      const options = {
        repo: url,
        branch: branch,
        user: {
          name: 'User Name',
          email: 'user@email.com'
        }
      };
      ghPages.publish(local, options, function(err) {
        if (err) {
          return done(err);
        }
        helper
          .assertContentsMatch(local, url, branch)
          .then(function() {
            done();
          })
          .catch(done);
      });
    });
  });
});
