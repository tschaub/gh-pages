const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const ghPages = require('../../lib/index.js');
const helper = require('../helper.js');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'cname-exists';

beforeEach(() => {
  ghPages.clean();
});

describe('the --cname option', () => {
  it('works even if the CNAME file already exists AND replaces any existing value', (done) => {
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
