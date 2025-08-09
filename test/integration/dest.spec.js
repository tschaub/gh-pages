const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const ghPages = require('../../lib/index.js');
const helper = require('../helper.js');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'dest';

beforeEach(() => {
  ghPages.clean();
});

describe('the dest option', () => {
  it('allows publishing to a subdirectory within a branch', async () => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';
    const dest = 'target';

    const url = await helper.setupRemote(fixtureName, {branch});
    const options = {
      repo: url,
      dest: dest,
      user: {
        name: 'User Name',
        email: 'user@email.com',
      },
    };

    await ghPages.publish(local, options);
    await helper.assertContentsMatch(expected, url, branch);
  });
});
