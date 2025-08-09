const path = require('path');
const chai = require('chai');
const compare = require('dir-compare').compareSync;
const fs = require('fs-extra');
const tmp = require('tmp');
const Git = require('../lib/git.js');

/**
 * Turn off maxListeners warning during the tests
 * See: https://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
 */
require('events').EventEmitter.prototype._maxListeners = 0;

/** @type {boolean} */
chai.config.includeStack = true;

/**
 * Chai's assert function configured to include stacks on failure.
 * @type {Function}
 */
exports.assert = chai.assert;

const fixtures = path.join(__dirname, 'integration', 'fixtures');

/**
 * @return {Promise<string>} A promise that resolves to the path.
 */
function mkdtemp() {
  return new Promise((resolve, reject) => {
    tmp.dir({unsafeCleanup: true}, (err, tmpPath) => {
      if (err) {
        return reject(err);
      }
      resolve(tmpPath);
    });
  });
}

/**
 * Creates a git repo with the contents of a fixture.
 * @param {string} fixtureName Name of fixture.
 * @param {Object} options Repo options.
 * @return {Promise<string>} A promise for the path to the repo.
 */
async function setupRepo(fixtureName, options) {
  const branch = options.branch || 'gh-pages';
  const userEmail = (options.user && options.user.email) || 'user@email.com';
  const userName = (options.user && options.user.name) || 'User Name';
  const dir = await mkdtemp();
  const fixturePath = path.join(fixtures, fixtureName, 'remote');
  await fs.copy(fixturePath, dir);

  const git = new Git(dir);
  await git.init();
  await git.exec('config', 'user.email', userEmail);
  await git.exec('config', 'user.name', userName);
  await git.exec('checkout', '--orphan', branch);
  await git.add('.');
  await git.commit('Initial commit');
  return git.cwd;
}

/**
 * Creates a git repo with the contents of a fixture and pushes to a remote.
 * @param {string} fixtureName Name of the fixture.
 * @param {Object} options Repo options.
 * @return {Promise} A promise.
 */
async function setupRemote(fixtureName, options) {
  const branch = options.branch || 'gh-pages';
  const dir = await setupRepo(fixtureName, options);
  const remote = await mkdtemp();
  await new Git(remote).exec('init', '--bare');
  const remote_1 = remote;
  const git = new Git(dir);
  const url = 'file://' + remote_1;
  await git.exec('push', url, branch);
  return url;
}

/**
 * @param {string} dir The dir.
 * @param {string} url The url.
 * @param {string} branch The branch.
 * @return {Promise} A promise.
 */
async function assertContentsMatch(dir, url, branch) {
  const root = await mkdtemp();
  const clone = path.join(root, 'repo');
  const options = {git: 'git', remote: 'origin', depth: 1};
  const git = await Git.clone(url, clone, branch, options);
  const comparison = compare(dir, git.cwd, {excludeFilter: '.git'});
  if (comparison.same) {
    return true;
  } else {
    const message = comparison.diffSet
      .map((entry) => {
        const state = {
          equal: '==',
          left: '->',
          right: '<-',
          distinct: '<>',
        }[entry.state];
        const name1 = entry.name1 ? entry.name1 : '<none>';
        const name2 = entry.name2 ? entry.name2 : '<none>';

        return [name1, state, name2].join(' ');
      })
      .join('\n');
    throw new Error('Directories do not match:\n' + message);
  }
}

exports.assertContentsMatch = assertContentsMatch;
exports.setupRemote = setupRemote;
exports.setupRepo = setupRepo;
