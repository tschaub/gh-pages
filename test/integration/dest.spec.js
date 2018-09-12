const helper = require('../helper');
const ghPages = require('../../lib/');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'dest';

beforeEach(function() {
  ghPages.clean();
});

describe('the dest option', function() {
  it('allows publishing to a subdirectory within a branch', function(done) {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';
    const dest = 'target';

    helper.setupRemote(fixtureName, branch).then(function(url) {
      const options = {
        repo: url,
        dest: dest,
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
});
