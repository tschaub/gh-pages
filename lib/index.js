var copy = require('./util').copy;
var fs = require('fs-extra');
var git = require('./git');
var globby = require('globby');
var path = require('path');

function getCacheDir() {
  return path.relative(process.cwd(), path.resolve(__dirname, '../.cache'));
}

function getRemoteUrl(dir, remote) {
  var repo;
  return git(['config', '--get', 'remote.' + remote + '.url'], dir)
    .then(function(output) {
      repo = output.split(/[\n\r]/).shift();
      if (repo) {
        return repo;
      } else {
        throw new Error(
          'Failed to get repo URL from options or current directory.'
        );
      }
    })
    .catch(function(err) {
      throw new Error(
        'Failed to get remote.' +
          remote +
          '.url (task must either be ' +
          'run in a git repository with a configured ' +
          remote +
          ' remote ' +
          'or must be configured with the "repo" option).'
      );
    });
}

function getRepo(options) {
  if (options.repo) {
    return Promise.resolve(options.repo);
  } else {
    return getRemoteUrl(process.cwd(), options.remote);
  }
}

/**
 * Push a git branch to a remote (pushes gh-pages by default).
 * @param {string} basePath The base path.
 * @param {Object} config Publish options.
 * @param {Function} callback Callback.
 */
exports.publish = function publish(basePath, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  var defaults = {
    add: false,
    git: 'git',
    clone: getCacheDir(),
    dotfiles: false,
    branch: 'gh-pages',
    remote: 'origin',
    src: '**/*',
    only: '.',
    push: true,
    message: 'Updates',
    silent: false,
    logger: function() {}
  };

  var options = Object.assign({}, defaults, config);

  function log(message) {
    if (!options.silent) {
      options.logger(message);
    }
  }

  if (!callback) {
    callback = function(err) {
      if (err) {
        log(err.message);
      }
    };
  }

  function done(err) {
    try {
      callback(err);
    } catch (err2) {
      log('Publish callback threw: ', err2.message);
    }
  }

  try {
    if (!fs.statSync(basePath).isDirectory()) {
      done(new Error('The "base" option must be an existing directory'));
      return;
    }
  } catch (err) {
    done(err);
    return;
  }

  var files = globby
    .sync(options.src, {
      cwd: basePath,
      dot: options.dotfiles
    })
    .filter(function(file) {
      return !fs.statSync(path.join(basePath, file)).isDirectory();
    });

  if (!Array.isArray(files) || files.length === 0) {
    done(new Error('Files must be provided in the "src" property.'));
    return;
  }

  var only = globby.sync(options.only, {cwd: basePath});

  git.exe(options.git);

  var repoUrl;
  getRepo(options)
    .then(function(repo) {
      repoUrl = repo;
      log('Cloning ' + repo + ' into ' + options.clone);
      return git.clone(repo, options.clone, options.branch, options);
    })
    .then(function() {
      return getRemoteUrl(options.clone, options.remote).then(function(url) {
        if (url !== repoUrl) {
          var message =
            'Remote url mismatch.  Got "' +
            url +
            '" ' +
            'but expected "' +
            repoUrl +
            '" in ' +
            options.clone +
            '.  If you have changed your "repo" option, try ' +
            'running the "clean" task first.';
          throw new Error(message);
        }
      });
    })
    .then(function() {
      // only required if someone mucks with the checkout between builds
      log('Cleaning');
      return git.clean(options.clone);
    })
    .then(function() {
      log('Fetching ' + options.remote);
      return git.fetch(options.remote, options.clone);
    })
    .then(function() {
      log('Checking out ' + options.remote + '/' + options.branch);
      return git.checkout(options.remote, options.branch, options.clone);
    })
    .then(function() {
      if (!options.add) {
        log('Removing files');
        return git.rm(only.join(' '), options.clone);
      }
    })
    .then(function() {
      log('Copying files');
      return copy(files, basePath, options.clone);
    })
    .then(function() {
      log('Adding all');
      return git.add('.', options.clone);
    })
    .then(function() {
      if (options.user) {
        return git(
          ['config', 'user.email', options.user.email],
          options.clone
        ).then(function() {
          return git(['config', 'user.name', options.user.name], options.clone);
        });
      }
    })
    .then(function() {
      log('Committing');
      return git.commit(options.message, options.clone);
    })
    .then(function() {
      if (options.tag) {
        log('Tagging');
        return git.tag(options.tag, options.clone).catch(function(error) {
          // tagging failed probably because this tag alredy exists
          log('Tagging failed, continuing');
          options.logger(error);
        });
      }
    })
    .then(function() {
      if (options.push) {
        log('Pushing');
        return git.push(options.remote, options.branch, options.clone);
      }
    })
    .then(
      function() {
        done();
      },
      function(error) {
        if (options.silent) {
          error = new Error(
            'Unspecified error (run without silent option for detail)'
          );
        }
        done(error);
      }
    );
};

/**
 * Clean the cache directory.
 */
exports.clean = function clean() {
  fs.removeSync(getCacheDir());
};
