#!/usr/bin/env zx
import { $ } from "zx";

$.verbose = true;
// Installing packages
console.log("INSTALLING THE PACKAGES:");
await $`npm i`;
// Setup the pm2 with default command
console.log("STARTING PM2:");
await $`pm2 start "node index.js -c 1m" --watch`;
