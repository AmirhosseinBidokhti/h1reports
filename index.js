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









// const db = await JSONFilePreset('reportsDB.json', {})
// const disclosedReports = db.data

// let id = "Z2lkOi8vaGFja2Vyb25lL0NvbXBsZXRlSGFja3Rpdml0eVJlcG9ydEluZGV4LzIzMzQ0MjA"


// let {TELEGRAM_CHANNEL_ID, TELEGRAM_BOT_TOKEN} = process.env


// console.log("TELEGRAM_CHANNEL_ID", TELEGRAM_CHANNEL_ID);
// console.log("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN);

//console.log(disclosedReports.at(0));
//console.log(disclosedReports.find(report => report.id = id))
//let myMessage = disclosedReports.find(report => report.id = id);

//console.log("myMessage", myMessage);


//sendNotification(JSON.stringify(myMessage), TELEGRAM_CHANNEL_ID, TELEGRAM_BOT_TOKEN)


// Add verbose and logging function 
// Add switch to determine the cronjob
// 
