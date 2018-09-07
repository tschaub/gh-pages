#!/usr/bin/env node

var ghpages = require('../lib/index');
var Git = require('../lib/git');
var program = require('commander');
var path = require('path');
var pkg = require('../package.json');

function main(args) {
  program
    .version(pkg.version)
    .option('-d, --dist <dist>', 'Base directory for all source files')
    .option(
      '-s, --src <src>',
      'Pattern used to select which files to publish',
      '**/*'
    )
    .option(
      '-b, --branch <branch>',
      'Name of the branch you are pushing to',
      'gh-pages'
    )
    .option(
      '-e, --dest <dest>',
      'Target directory within the destination branch (relative to the root)',
      '.'
    )
    .option('-a, --add', 'Only add, and never remove existing files')
    .option('-x, --silent', 'Do not output the repository url')
    .option('-m, --message <message>', 'commit message', 'Updates')
    .option('-g, --tag <tag>', 'add tag to commit')
    .option('-t, --dotfiles', 'Include dotfiles')
    .option('-r, --repo <repo>', 'URL of the repository you are pushing to')
    .option('-p, --depth <depth>', 'depth for clone', 1)
    .option('-o, --remote <name>', 'The name of the remote', 'origin')
    .option(
      '-v, --remove <pattern>',
      'Remove files that match the given pattern ' +
        '(ignored if used together with --add).',
      '.'
    )
    .option('-n, --no-push', 'Commit only (with no push)')
    .option('-l, --localuser', 'Use Git local user config (not global)')
    .option('-u, --user <username,email>', 'Override default username, email')
    .parse(args);

  if (program.localuser) {
    Promise.all([
      new Git().exec('config', '--local', 'user.name'),
      new Git().exec('config', '--local', 'user.email')
    ]).then(results => {
      publish({
        name: results[0].output.trim(),
        email: results[1].output.trim()
      });
    });
  } else if (program.user) {
    var userParts = program.user.split(',');
    publish({
      name: userParts[0],
      email: userParts[1]
    });
  } else {
    publish();
  }

  function publish(user) {
    ghpages.publish(
      path.join(process.cwd(), program.dist),
      {
        repo: program.repo,
        silent: !!program.silent,
        branch: program.branch,
        src: program.src,
        dest: program.dest,
        message: program.message,
        tag: program.tag,
        dotfiles: !!program.dotfiles,
        add: !!program.add,
        only: program.remove,
        remote: program.remote,
        push: !!program.push,
        user: user
      },
      function(err) {
        if (err) {
          process.stderr.write(err.message + '\n');
          return process.exit(1);
        }
        process.stderr.write('Published\n');
      }
    );
  }
}

if (require.main === module) {
  main(process.argv);
}

module.exports = main;
