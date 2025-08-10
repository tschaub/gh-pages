const path = require('path');
const util = require('util');
const filenamify = require('filenamify');
const findCacheDir = require('find-cache-dir');
const fs = require('fs-extra');
const globby = require('globby');
const Git = require('./git.js');
const copy = require('./util.js').copy;
const getUser = require('./util.js').getUser;

const log = util.debuglog('gh-pages');

/**
 * Get the cache directory.
 * @param {string} [optPath] Optional path.
 * @return {string} The full path to the cache directory.
 */
function getCacheDir(optPath) {
  const dir = findCacheDir({name: 'gh-pages'});
  if (!optPath) {
    return dir;
  }

  return path.join(dir, filenamify(optPath));
}

/**
 * Clean the cache directory.
 */
exports.clean = function clean() {
  fs.removeSync(getCacheDir());
};

exports.defaults = {
  dest: '.',
  add: false,
  git: 'git',
  depth: 1,
  dotfiles: false,
  branch: 'gh-pages',
  remote: 'origin',
  src: '**/*',
  remove: '**/*',
  push: true,
  history: true,
  message: 'Updates',
  silent: false,
};

exports.getCacheDir = getCacheDir;

async function getRepo(options) {
  if (options.repo) {
    return options.repo;
  }
  const git = new Git(process.cwd(), options.git);
  return git.getRemoteUrl(options.remote);
}

/**
 * Push a git branch to a remote (pushes gh-pages by default).
 * @param {string} basePath The base path.
 * @param {Object} options Publish options.
 * @return {Promise} A promise.
 */
async function publishInternal(basePath, options) {
  // For backward compatibility before fixing #334
  if (options.only) {
    options.remove = options.only;
  }

  if (!(await fs.stat(basePath)).isDirectory()) {
    throw new Error('The "base" option must be an existing directory');
  }

  const files = await globby(options.src, {
    cwd: basePath,
    dot: options.dotfiles,
    onlyFiles: true,
  });

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error(
      'The pattern in the "src" property didn\'t match any files.',
    );
  }

  let userPromise;
  if (options.user) {
    userPromise = Promise.resolve(options.user);
  } else {
    userPromise = getUser();
  }
  const user = await userPromise;
  const repoUrl = await getRepo(options);
  const clone = getCacheDir(repoUrl);

  log('Cloning %s into %s', repoUrl, clone);
  const git = await Git.clone(repoUrl, clone, options.branch, options);
  const url = await git.getRemoteUrl(options.remote);
  if (url !== repoUrl) {
    throw new Error(
      `Remote url mismatch.  Got "${url}" but expected "${repoUrl}" in ${git.cwd}.  Try running the gh-pages-clean script first.`,
    );
  }

  // only required if someone mucks with the checkout between builds
  log('Cleaning');
  await git.clean();

  log('Fetching %s', options.remote);
  await git.fetch(options.remote);

  log('Checking out %s/%s ', options.remote, options.branch);
  await git.checkout(options.remote, options.branch);

  if (!options.history) {
    await git.deleteRef(options.branch);
  }

  if (!options.add) {
    log('Removing files');
    const files = (
      await globby(options.remove, {
        cwd: path.join(git.cwd, options.dest),
        dot: true,
      })
    ).map((file) => path.join(options.dest, file));
    if (files.length > 0) {
      await git.rm(files);
    }
  }

  if (options.nojekyll) {
    log('Creating .nojekyll');
    await fs.createFile(path.join(git.cwd, '.nojekyll'));
  }

  if (options.cname) {
    log('Creating CNAME for %s', options.cname);
    await fs.writeFile(path.join(git.cwd, 'CNAME'), options.cname);
  }

  log('Copying files');
  await copy(files, basePath, path.join(git.cwd, options.dest));

  if (options.beforeAdd) {
    await options.beforeAdd(git);
  }

  log('Adding all');
  await git.add('.');

  if (user) {
    await git.exec('config', 'user.email', user.email);
    if (user.name) {
      await git.exec('config', 'user.name', user.name);
    }
  }

  log('Committing');
  await git.commit(options.message);

  if (options.tag) {
    log('Tagging');
    try {
      await git.tag(options.tag);
    } catch (error) {
      // tagging failed probably because this tag alredy exists
      log(error);
      log('Tagging failed, continuing');
    }
  }

  if (options.push) {
    log('Pushing');
    await git.push(options.remote, options.branch, !options.history);
  }
}

/**
 * Push a git branch to a remote (pushes gh-pages by default).
 * @param {string} basePath The base path.
 * @param {Object} config Publish options.
 * @param {Function} callback Callback.
 * @return {Promise} A promise.
 */
exports.publish = async function publish(basePath, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  if (!callback) {
    callback = function (err) {
      if (err) {
        log(err.message);
      }
    };
  }

  function done(err) {
    try {
      callback(err);
    } catch (err2) {
      log('Publish callback threw: %s', err2.message);
    }
  }

  const options = Object.assign({}, exports.defaults, config);
  try {
    await publishInternal(basePath, options);
  } catch (error) {
    if (options.silent) {
      done(
        new Error('Unspecified error (run without silent option for detail)'),
      );
    } else {
      done(error);
    }
    return Promise.reject(error);
  }
};
