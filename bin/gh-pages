#!/usr/bin/env node

var ghpages = require('../lib/index');
var program = require('commander');
var path = require('path');

program
  .version(require('../package').version)
  .option('-d, --dist <dist>',
      'base directory for all source files')
  .option('-s, --src <src>',
      'pattern used to select which files should be published', '**/*')
  .option('-r, --repo <repo>',
      'URL of the repository you\'ll be pushing to')
  .option('-x, --silent', 'Do not output the repository url')
  .option('-b, --branch <branch>',
      'name of the branch you\'ll be pushing to', 'gh-pages')
  .option('-o, --remote <name>',
      'The name of the remote', 'origin')
  .option('-m, --message <message>',
      'commit message', 'Updates')
  .option('-g, --tag <tag>',
      'add tag to commit')
  .option('-t, --dotfiles', 'Include dotfiles')
  .option('-a, --add', 'Only add, and never remove existing files.')
  .option('-v, --remove <pattern>',
      'Remove files that match the given pattern ' +
      '(ignored if used together with --add).', '.')
  .option('-n, --no-push', 'Commit only (with no push)')
  .parse(process.argv);

ghpages.publish(path.join(process.cwd(), program.dist), {
  repo: program.repo,
  silent: !!program.silent,
  branch: program.branch,
  src: program.src,
  message: program.message,
  tag: program.tag,
  dotfiles: !!program.dotfiles,
  add: !!program.add,
  only: program.remove,
  remote: program.remote,
  push: !program.noPush,
  logger: function(message) {
    process.stderr.write(message + '\n');
  }
}, function(err) {
  if (err) {
    process.stderr.write(err.message + '\n');
    return process.exit(1);
  }
  process.stderr.write('Published\n');
});
