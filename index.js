import { JSONFilePreset } from 'lowdb/node'
import { program } from 'commander';

import { checkAndInsert, seeder } from './fetcher.js';
import { cronSchedule } from './cronScheduler.js';
import { Logger } from './message.js';

program
  .option('-i, --init', 'Run seeder function')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-c, --cronjob <value>', 'Set desired cronjob value')
  .parse(process.argv);

const {init, verbose, cronjob} = program.opts();

const logger = new Logger(verbose)

async function main() {
    if (init) {
        logger.info('Running the seeder function...');
        await seeder();
    }

    if (cronjob) {
          cronSchedule(cronjob, checkAndInsert)
    } else {
        logger.info('Pleaser provide your cronjob in order to run the tool.')
        process.exit(1)
    }
}

main();