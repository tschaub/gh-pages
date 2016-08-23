import yargs from 'yargs';
import { publish } from './index';

const argv = yargs
  .usage('Usage: $0 [options]')

  .example('gh-pages')

  .options({
    src: {
      description: 'path for deployment',
      alias: 's',
      required: true,
    },
  })
  .help('help')
  .alias('help', 'h')
  .showHelpOnFail(false, 'whoops, something went wrong! run with --help')
  .argv;

publish(argv)
  .catch(console.log);
