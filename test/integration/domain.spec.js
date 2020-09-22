const helper = require('../helper');
const ghPages = require('../../lib');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'domain';

beforeEach(() => {
  ghPages.clean();
});

describe('the domain option', () => {
  it('adds CNAME file', done => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';

    helper.setupRemote(fixtureName, {branch}).then(url => {
      const options = {
        repo: url,
        user: {
          name: 'User Name',
          email: 'user@email.com'
        },
        domain: 'customdomain.github.io'
      };

      ghPages.publish(local, options, err => {
        if (err) {
          return done(err);
        }
        helper
          .assertContentsMatch(expected, url, branch)
          .then(() => done())
          .catch(done);
      });
    });
  });
});
