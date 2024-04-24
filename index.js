import { program } from "commander";

import { checkAndInsert, seeder } from "./fetcher.js";
import { cronSchedule } from "./cronScheduler.js";
import { Logger } from "./message.js";

program
  .option("-i, --init", "Run seeder function")
  .option("-v, --verbose", "Enable verbose logging")
  .requiredOption(
    "-c, --cronjob <value>",
    "Set desired cronjob value (e.g. -c 2h, -c 1d, or -c 30m)"
  )
  .parse(process.argv);

const { init, verbose, cronjob } = program.opts();

const logger = new Logger(verbose);

async function main() {
  if (init) {
    logger.info("Running the seeder function...");
    await seeder();
  }

  if (cronjob) {
    console.log(`[+] Starting the cronjob ${cronjob}`);
    cronSchedule(cronjob, checkAndInsert);
  } else {
    logger.info("Pleaser provide your cronjob in order to run the tool.");
    process.exit(1);
  }
}

main();
