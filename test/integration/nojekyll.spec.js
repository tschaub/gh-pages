const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const ghPages = require('../../lib/index.js');
const helper = require('../helper.js');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'nojekyll';

beforeEach(() => {
  ghPages.clean();
});

describe('the --nojekyll option', () => {
  it('adds a .nojekyll file', async () => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';

    const url = await helper.setupRemote(fixtureName, {branch});
    const options = {
      repo: url,
      user: {
        name: 'User Name',
        email: 'user@email.com',
      },
      nojekyll: true,
    };
    await ghPages.publish(local, options);
    await helper.assertContentsMatch(expected, url, branch);
  });
});
