const cp = require('child_process');
const path = require('path');
const fs = require('fs-extra');

/**
 * @function Object() { [native code] }
 * @param {number} code Error code.
 * @param {string} message Error message.
 */
class ProcessError extends Error {
  constructor(code, message) {
    super(message);

    /**
     * @type {string}
     */
    this.name = 'ProcessError';

    /**
     * @type {number}
     */
    this.code = code;
  }
}

/**
 * Util function for handling spawned processes as promises.
 * @param {string} exe Executable.
 * @param {Array<string>} args Arguments.
 * @param {string} cwd Working directory.
 * @return {Promise} A promise.
 */
function spawn(exe, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(exe, args, {cwd: cwd || process.cwd()});
    const buffer = [];
    child.stderr.on('data', (chunk) => {
      buffer.push(chunk.toString());
    });
    child.stdout.on('data', (chunk) => {
      buffer.push(chunk.toString());
    });
    child.on('close', (code) => {
      const output = buffer.join('');
      if (code) {
        const msg = output || 'Process failed: ' + code;
        reject(new ProcessError(code, msg));
      } else {
        resolve(output);
      }
    });
  });
}

/**
 * Util function to process large array of files in batches to avoid generating too long commands.
 * @param {Array<string>} files to process.
 * @param {Function} fn Function to call for each batch. Should return a promise.
 * @param {number} batchSize Size of each batch.
 * @return {Promise} A promise.
 */
async function processInBatches(files, fn, batchSize = 50) {
  let result;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    result = await fn(batch);
  }
  return result;
}

/**
 * Create an object for executing git commands.
 * @param {string} cwd Repository directory.
 * @param {string} cmd Git executable (full path if not already on path).
 * @function Object() { [native code] }
 */
class Git {
  constructor(cwd, cmd) {
    this.cwd = cwd;
    this.cmd = cmd || 'git';
    this.output = '';
  }
  /**
   * Clone a repo into the given dir if it doesn't already exist.
   * @param {string} repo Repository URL.
   * @param {string} dir Target directory.
   * @param {string} branch Branch name.
   * @param {options} options All options.
   * @return {Promise<Git>} A promise.
   */
  static async clone(repo, dir, branch, options) {
    const exists = await fs.exists(dir);
    if (exists) {
      return new Git(dir, options.git);
    }

    await fs.mkdirp(path.dirname(path.resolve(dir)));

    const args = [
      'clone',
      repo,
      dir,
      '--branch',
      branch,
      '--single-branch',
      '--origin',
      options.remote,
      '--depth',
      options.depth,
    ];

    try {
      await spawn(options.git, args);
    } catch {
      await spawn(options.git, [
        'clone',
        repo,
        dir,
        '--origin',
        options.remote,
      ]);
    }
    return new Git(dir, options.git);
  }

  /**
   * Execute an arbitrary git command.
   * @param {Array<string>} args Arguments (e.g. ['remote', 'update']).
   * @return {Promise} A promise.  The promise will be resolved with this instance
   *     or rejected with an error.
   */
  async exec(...args) {
    this.output = await spawn(this.cmd, [...args], this.cwd);
    return this;
  }

  /**
   * Initialize repository.
   * @return {Promise} A promise.
   */
  init() {
    return this.exec('init');
  }

  /**
   * Clean up unversioned files.
   * @return {Promise} A promise.
   */
  clean() {
    return this.exec('clean', '-f', '-d');
  }

  /**
   * Hard reset to remote/branch
   * @param {string} remote Remote alias.
   * @param {string} branch Branch name.
   * @return {Promise} A promise.
   */
  reset(remote, branch) {
    return this.exec('reset', '--hard', remote + '/' + branch);
  }

  /**
   * Fetch from a remote.
   * @param {string} remote Remote alias.
   * @return {Promise} A promise.
   */
  fetch(remote) {
    return this.exec('fetch', remote);
  }

  /**
   * Checkout a branch (create an orphan if it doesn't exist on the remote).
   * @param {string} remote Remote alias.
   * @param {string} branch Branch name.
   * @return {Promise} A promise.
   */
  async checkout(remote, branch) {
    const treeish = remote + '/' + branch;

    try {
      return await this.exec('ls-remote', '--exit-code', '.', treeish);
    } catch (error) {
      if (error instanceof ProcessError && error.code === 2) {
        // branch doesn't exist, create an orphan
        return await this.exec('checkout', '--orphan', branch);
      } else {
        // unhandled error
        throw error;
      }
    }
  }

  /**
   * Remove all unversioned files.
   * @param {string | Array<string>} files Files argument.
   * @return {Promise} A promise.
   */
  rm(files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    return processInBatches(files, (batch) =>
      this.exec('rm', '--ignore-unmatch', '-r', '-f', '--', ...batch),
    );
  }

  /**
   * Add files.
   * @param {string | Array<string>} files Files argument.
   * @return {Promise} A promise.
   */
  add(files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    return processInBatches(files, (batch) => this.exec('add', ...batch));
  }

  /**
   * Commit (if there are any changes).
   * @param {string} message Commit message.
   * @return {Promise} A promise.
   */
  async commit(message) {
    try {
      return await this.exec('diff-index', '--quiet', 'HEAD');
    } catch {
      return await this.exec('commit', '-m', message);
    }
  }

  /**
   * Add tag
   * @param {string} name Name of tag.
   * @return {Promise} A promise.
   */
  tag(name) {
    return this.exec('tag', name);
  }

  /**
   * Push a branch.
   * @param {string} remote Remote alias.
   * @param {string} branch Branch name.
   * @param {boolean} force Force push.
   * @return {Promise} A promise.
   */
  push(remote, branch, force) {
    const args = ['push', '--tags', remote, branch];
    if (force) {
      args.push('--force');
    }
    return this.exec.apply(this, args);
  }

  /**
   * Get the URL for a remote.
   * @param {string} remote Remote alias.
   * @return {Promise<string>} A promise for the remote URL.
   */
  async getRemoteUrl(remote) {
    try {
      const git = await this.exec(
        'config',
        '--get',
        'remote.' + remote + '.url',
      );
      const repo = git.output && git.output.split(/[\n\r]/).shift();
      if (repo) {
        return repo;
      } else {
        throw new Error(
          'Failed to get repo URL from options or current directory.',
        );
      }
    } catch {
      throw new Error(
        'Failed to get remote.' +
          remote +
          '.url (task must either be ' +
          'run in a git repository with a configured ' +
          remote +
          ' remote ' +
          'or must be configured with the "repo" option).',
      );
    }
  }

  /**
   * Delete ref to remove branch history
   * @param {string} branch The branch name.
   * @return {Promise} A promise.  The promise will be resolved with this instance
   *     or rejected with an error.
   */
  deleteRef(branch) {
    return this.exec('update-ref', '-d', 'refs/heads/' + branch);
  }
}

module.exports = Git;
