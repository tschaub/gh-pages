const helper = require('../helper.js');
const ghPages = require('../../lib/index.js');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'cname';

beforeEach(() => {
  ghPages.clean();
});

describe('the --cname option', () => {
  it('adds a CNAME file', (done) => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';

    helper.setupRemote(fixtureName, {branch}).then((url) => {
      const options = {
        repo: url,
        user: {
          name: 'User Name',
          email: 'user@email.com',
        },
        cname: 'custom-domain.com',
      };
      ghPages.publish(local, options, (err) => {
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
