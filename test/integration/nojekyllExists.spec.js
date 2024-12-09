const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const ghPages = require('../../lib/index.js');
const helper = require('../helper.js');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'nojekyll-exists';

beforeEach(() => {
  ghPages.clean();
});

describe('the --nojekyll option', () => {
  it('works even if the .nojekyll file already exists', (done) => {
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
        nojekyll: true,
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
