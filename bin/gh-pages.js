#!/usr/bin/env node

const ghpages = require('../lib/index.js');
const {Command} = require('commander');
const path = require('path');
const pkg = require('../package.json');
const addr = require('email-addresses');

function publish(dist, config) {
  return new Promise((resolve, reject) => {
    const basePath = path.resolve(process.cwd(), dist);
    ghpages.publish(basePath, config, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function main(args) {
  return Promise.resolve().then(() => {
    const program = new Command()
      .version(pkg.version)
      .requiredOption(
        '-d, --dist <dist>',
        'Base directory for all source files'
      )
      .option(
        '-s, --src <src>',
        'Pattern used to select which files to publish',
        ghpages.defaults.src
      )
      .option(
        '-b, --branch <branch>',
        'Name of the branch you are pushing to',
        ghpages.defaults.branch
      )
      .option(
        '-e, --dest <dest>',
        'Target directory within the destination branch (relative to the root)',
        ghpages.defaults.dest
      )
      .option('-a, --add', 'Only add, and never remove existing files')
      .option('-x, --silent', 'Do not output the repository url')
      .option(
        '-m, --message <message>',
        'commit message',
        ghpages.defaults.message
      )
      .option('-g, --tag <tag>', 'add tag to commit')
      .option('--git <git>', 'Path to git executable', ghpages.defaults.git)
      .option('-t, --dotfiles', 'Include dotfiles')
      .option('-r, --repo <repo>', 'URL of the repository you are pushing to')
      .option('-p, --depth <depth>', 'depth for clone', ghpages.defaults.depth)
      .option(
        '-o, --remote <name>',
        'The name of the remote',
        ghpages.defaults.remote
      )
      .option(
        '-u, --user <address>',
        'The name and email of the user (defaults to the git config).  Format is "Your Name <email@example.com>".'
      )
      .option(
        '-v, --remove <pattern>',
        'Remove files that match the given pattern ' +
          '(ignored if used together with --add).',
        ghpages.defaults.remove
      )
      .option('-n, --no-push', 'Commit only (with no push)')
      .option(
        '-f, --no-history',
        'Push force new commit without parent history'
      )
      .option(
        '--before-add <file>',
        'Execute the function exported by <file> before "git add"'
      )
      .parse(args);

    const options = program.opts();

    let user;
    if (options.user) {
      const parts = addr.parseOneAddress(options.user);
      if (!parts) {
        throw new Error(
          `Could not parse name and email from user option "${options.user}" ` +
            '(format should be "Your Name <email@example.com>")'
        );
      }
      user = {name: parts.name, email: parts.address};
    }
    let beforeAdd;
    if (options.beforeAdd) {
      const m = require(require.resolve(options.beforeAdd, {
        paths: [process.cwd()],
      }));

      if (typeof m === 'function') {
        beforeAdd = m;
      } else if (typeof m === 'object' && typeof m.default === 'function') {
        beforeAdd = m.default;
      } else {
        throw new Error(
          `Could not find function to execute before adding files in ` +
            `"${options.beforeAdd}".\n `
        );
      }
    }

    const config = {
      repo: options.repo,
      silent: !!options.silent,
      branch: options.branch,
      src: options.src,
      dest: options.dest,
      message: options.message,
      tag: options.tag,
      git: options.git,
      depth: options.depth,
      dotfiles: !!options.dotfiles,
      add: !!options.add,
      remove: options.remove,
      remote: options.remote,
      push: !!options.push,
      history: !!options.history,
      user: user,
      beforeAdd: beforeAdd,
    };

    return publish(options.dist, config);
  });
}

if (require.main === module) {
  main(process.argv)
    .then(() => {
      process.stdout.write('Published\n');
    })
    .catch((err) => {
      process.stderr.write(`${err.stack}\n`, () => process.exit(1));
    });
}

module.exports = main;
exports = module.exports;
