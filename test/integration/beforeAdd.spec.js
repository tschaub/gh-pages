const helper = require('../helper');
const ghPages = require('../../lib/');
const path = require('path');

const fixtures = path.join(__dirname, 'fixtures');
const fixtureName = 'beforeAdd';

beforeEach(() => {
  ghPages.clean();
});

describe('the beforeAdd option', () => {
  it('runs a provided async function before adding files', done => {
    const local = path.join(fixtures, fixtureName, 'local');
    const expected = path.join(fixtures, fixtureName, 'expected');
    const branch = 'gh-pages';

    helper.setupRemote(fixtureName, {branch}).then(url => {
      const options = {
        repo: url,
        add: true,
        beforeAdd(git) {
          return Promise.resolve().then(() => {
            return git.rm('hello-outdated-world.txt');
          });
        },
        user: {
          name: 'User Name',
          email: 'user@email.com'
        }
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
