const path = require('path');
const {beforeEach, describe, it} = require('mocha');
const ghPages = require('../../lib/index.js');
const helper = require('../helper.js');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'remove';

beforeEach(() => {
  ghPages.clean();
});

describe('the remove option', () => {
  it('removes matched files in remote branch', async () => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';
    const remove = '*.{js,css}';

    const url = await helper.setupRemote(fixtureName, {branch});
    const options = {
      repo: url,
      user: {
        name: 'User Name',
        email: 'user@email.com',
      },
      remove: remove,
    };

    await ghPages.publish(local, options);
    await helper.assertContentsMatch(expected, url, branch);
  });

  it('skips removing files if there are no files to be removed', async () => {
    const local = path.join(fixtures, fixtureName, 'remote');
    const branch = 'gh-pages';
    const remove = 'non-exist-file';

    const url = await helper.setupRemote(fixtureName, {branch});
    const options = {
      repo: url,
      user: {
        name: 'User Name',
        email: 'user@email.com',
      },
      remove: remove,
    };

    await ghPages.publish(local, options);
    await helper.assertContentsMatch(local, url, branch);
  });
});
